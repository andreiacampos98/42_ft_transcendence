import json
from ..views import tournament_init_phase
from ..models import Tournaments, TournamentsGames, TournamentsUsers, Users
from ..serializers import GamesSerializer, TournamentsGamesSerializer, TournamentsUsersSerializer, UsersSerializer
from icecream import ic

from django_redis import get_redis_connection
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

phase_after = dict(zip(
	['Last 16', 'Quarter-final', 'Semi-final', 'Final'], 
	['Quarter-final', 'Semi-final', 'Final', None]
))

phase_of = dict(zip(
	[16, 8, 4], 
	['Last 16', 'Quarter-final', 'Semi-final']
))


class TournamentConsumer(AsyncWebsocketConsumer):
	# active_tournaments = {}

	async def connect(self):
		await self.accept()
		self.user = self.scope['user']
		self.redis = get_redis_connection('default')
		self.tournament_id = self.scope["url_route"]["kwargs"]["tournament_id"]
		self.tournament_channel = f'tournament_{self.tournament_id}'
		self.tournament_instance = await self.get_tournament()
		self.tournament_state = None

		# Add user to the tournament wide channel
		await self.channel_layer.group_add(self.tournament_channel, self.channel_name)

		# Create cache in redis about tournament (if it does not exist) and about the user
		self.create_tournament_cache()
		await self.create_user_cache()
		await self.broadcast_player_list()

	
		if self.is_full():
			self.start_tournament()

			# ! ===========================================================================
		
		ic(self.get_cache(self.tournament_channel))


	async def disconnect(self, code):
		#! IMPORTANT Use tournament_leave handler to remote the user from the database
		# if self.tournament and self.user.id in self.tournament['users']:
		# 	del self.tournament['users'][self.user.id]

		# if self.tournament_id in self.active_tournaments and len(self.tournament['users']) == 0:
		# 	del self.active_tournaments[self.tournament_id]

		await self.channel_layer.group_discard(self.tournament_channel, self.channel_name)
		return await super().disconnect(code)
	

	async def receive(self, text_data):
		pass
		# broadcast_handlers = {}
		# message_handlers = {
		# 	'FINISH': self.on_game_finish
		# }
		
		# message = json.loads(text_data)
		# event = message['event']
	
		# if event in broadcast_handlers:
		# 	broadcast_handlers[event]()
		# else:
		# 	message_handlers[event](message['data'])

	# ! ============================== MESSAGING ===============================

	async def broadcast(self, event):		
		await self.send(text_data=event["message"])
	
	# ! ============================= DATABASE ACCESS ==========================

	@database_sync_to_async
	def get_tournament(self):
		return Tournaments.objects.get(pk=self.tournament_id)
	
	@database_sync_to_async
	def get_tournament_user(self, user_id):
		tour_user = TournamentsUsers.objects.get(tournament_id=self.tournament_id, user_id=user_id)
		user = Users.objects.get(pk=user_id)

		data = TournamentsUsersSerializer(tour_user).data
		data['user'] = UsersSerializer(user).data

		return data

	@database_sync_to_async
	def get_tournament_users(self):
		users = TournamentsUsers.objects.filter(tournament_id=self.tournament_id)

		for tour_user in users:
			user_data = Users.objects.get(pk=tour_user['user_id']) 
			tour_user['user'] = UsersSerializer(user_data).data

		return TournamentsUsersSerializer(users, many=True).data

	# ! ============================= REDIS ACCESS =============================

	def get_cache(self, key):
		return json.loads(self.redis.get(key).decode('UTF-8'))
	
	def set_cache(self, key, value):
		return self.redis.set(key, json.dumps(value))
	
	def create_tournament_cache(self):
		self.tournament_state = {
			'users': {},
			'curr_phase': phase_of[self.tournament_instance.capacity],
			'curr_phase_total_games': self.tournament_instance.capacity // 2,
			'curr_phase_finished_games': 0
		}

		if not self.redis.exists(f'tournament_{self.tournament_id}'):
			self.set_cache(self.tournament_channel, self.tournament_state)

	async def create_user_cache(self):
		tour_user = await self.get_tournament_user(self.user.id)

		tournament_data = self.get_cache(f'tournament_{self.tournament_id}')
		tournament_data['users'][self.user.id] = {
			'id': self.user.id,
			'username': self.user.username,
			'channel_name': self.channel_name,
			'tour_user': tour_user
		}
		self.set_cache(self.tournament_channel, tournament_data)


	# ! ===========================================================================

	def is_full(self):
		nb_users = len(self.get_cache(self.tournament_channel)['users'])
		return nb_users == self.tournament_instance.capacity
	
	def start_tournament(self):
		first_phase_games = tournament_init_phase(self.tournament_id)
		self.begin_phase(first_phase_games)

	async def broadcast_player_list(self):
		users_data = self.get_cache(f'tournament_{self.tournament_id}')['users']
		users = list(map(lambda x: x['tour_user'], users_data.values()))

		# Broadcast current list to all users
		await self.channel_layer.group_send(self.tournament_channel, {
			"type": "broadcast", 
			"message": json.dumps({
				'event': 'PLAYER_JOINED',
				'data': {
					'phase': self.tournament_state['curr_phase'].lower(),
					'players': users
				}
			})
		})
	
	

	# def add_new_tournament_user(self):
		# # Add the user to the users list
		# self.tournament['users'][self.user.id] = {
		# 	'id': self.user.id,
		# 	'username': self.user.username,
		# 	'channel_name': self.channel_name,
		# 	'game_room': '',
		# 	'ready_to_play': False,
		# }

		# # Gather info about the current tournament users
		# all_tour_users = TournamentsUsers.objects.filter(tournament_id=self.tournament_id)
		# tour_users_data = TournamentsUsersSerializer(all_tour_users, many=True).data

		# for tour_user in tour_users_data:
		# 	user = Users.objects.get(pk=tour_user['user_id']) 
		# 	tour_user['user'] = UsersSerializer(user).data

		# # Broadcast current list to all users
		# async_to_sync(self.channel_layer.group_send)(self.tournament_channel, {
		# 	"type": "broadcast", 
		# 	"message": json.dumps({
		# 		"event": 'PLAYER_JOINED',
		# 		"data": {
		# 			'phase': self.tournament['curr_phase'].lower(),
		# 			'players': tour_users_data
		# 		}
		# 	})
		# })


	# def on_game_finish(self, data):
	# 	ic('BEFORE', self.tournament['curr_phase'], self.tournament['curr_phase_total_games'], self.tournament['curr_phase_finished_games'])
	# 	self.tournament['curr_phase_finished_games'] += 1
	# 	winner = None
		
	# 	if self.tournament['curr_phase_finished_games'] < self.tournament['curr_phase_total_games']:
	# 		return 
		
	# 	# Replace information about the current phase with the next
	# 	last_phase = self.tournament['curr_phase']
	# 	last_phase_games = TournamentsGames.objects.filter(tournament_id=self.tournament_id, phase=last_phase)
	# 	self.tournament['curr_phase'] = phase_after[last_phase]
	# 	self.tournament['curr_phase_total_games'] //= 2
	# 	self.tournament['curr_phase_finished_games'] = 0
	# 	curr_phase = self.tournament['curr_phase']
	# 	curr_phase_games = TournamentsGames.objects.filter(tournament_id=self.tournament_id, phase=curr_phase)

	# 	# Join all phase winners
	# 	next_phase_users, last_phase_scores = [], []
	# 	ic(last_phase, curr_phase)
	# 	for tour_game in last_phase_games:
	# 		winnerID = tour_game.game_id.winner_id.id
			
	# 		tour_user = TournamentsUsers.objects.get(tournament_id=self.tournament_id, user_id=winnerID)
	# 		user = Users.objects.get(pk=tour_user.user_id.id) 
			
	# 		tour_user = TournamentsUsersSerializer(tour_user).data
	# 		tour_user['user'] = UsersSerializer(user).data
	# 		next_phase_users.append(tour_user)

	# 		username1, username2 = tour_game.game_id.user1_id.username, tour_game.game_id.user2_id.username
	# 		score1, score2 = tour_game.game_id.nb_goals_user1, tour_game.game_id.nb_goals_user2
	# 		game_data = {
	# 			'id': tour_game.game_id.id,
	# 			'username1': username1,
	# 			'username2': username2,
	# 			'score1': score1,
	# 			'score2': score2,
	# 		}
	# 		last_phase_scores.append(game_data)

	# 	if last_phase == 'Final':
	# 		user = Tournaments.objects.get(pk=self.tournament_id).winner_id
	# 		winner = TournamentsUsers.objects.get(tournament_id=self.tournament_id, user_id=user.id)
	# 		winner = TournamentsUsersSerializer(winner).data
	# 		winner['user'] = UsersSerializer(user).data
	# 		del self.active_tournaments[self.tournament_id]
					
	# 	# Send the new user pairs for the next phase
	# 	async_to_sync(self.channel_layer.group_send)(self.tournament_channel, {
	# 		"type": "broadcast", 
	# 		"message": json.dumps({
	# 			"event": 'END_PHASE',
	# 			"data": {
	# 				'phase': last_phase.lower(),
	# 				'next_phase': curr_phase.lower() if curr_phase else None,
	# 				'players': next_phase_users,
	# 				'results': last_phase_scores,
	# 				'winner': winner,
	# 			}
	# 		})
	# 	})

	# 	if last_phase != 'Final' and last_phase is not None:
	# 		self.begin_phase(curr_phase_games)

	# 	ic('AFTER', self.tournament['curr_phase'], self.tournament['curr_phase_total_games'], self.tournament['curr_phase_finished_games'])
				

	# def begin_phase(self, phase_games):
	# 	# And now pair up the players in their rooms
	# 	games = []
	# 	for tour_game in phase_games:
	# 		user1 = self.tournament['users'][tour_game.game_id.user1_id.id]
	# 		user2 = self.tournament['users'][tour_game.game_id.user2_id.id]

	# 		game_room = f'tournament_{self.tournament_id}_game_{tour_game.id}'
	# 		user1['game_room'] = user2['game_room'] = game_room

	# 		async_to_sync(self.channel_layer.group_add)(game_room, user1['channel_name'])
	# 		async_to_sync(self.channel_layer.group_add)(game_room, user2['channel_name'])

	# 		game_data = TournamentsGamesSerializer(tour_game).data
	# 		game_data['game_id'] = GamesSerializer(tour_game.game_id).data
	# 		game_data['user1_id'] = UsersSerializer(tour_game.game_id.user1_id).data
	# 		game_data['user2_id'] = UsersSerializer(tour_game.game_id.user2_id).data
	# 		game_data['phase'] = self.tournament['curr_phase'].lower()
	# 		games.append(game_data)
		
	# 	async_to_sync(self.channel_layer.group_send)(self.tournament_channel, {
	# 		"type": "broadcast", 
	# 		"message": json.dumps({
	# 			'event': 'BEGIN_PHASE',
	# 			'data': {
	# 				'phase': self.tournament['curr_phase'].lower(),
	# 				'games': games
	# 			}
	# 		})
	# 	})



