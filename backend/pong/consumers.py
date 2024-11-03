import json
from .views import game_create_helper, game_update_helper, tournament_init_phase, tournament_update_game_helper
from .models import Tournaments, TournamentsGames, TournamentsUsers, Users
from .serializers import GamesSerializer, TournamentsGamesSerializer, TournamentsUsersSerializer, UsersSerializer
from icecream import ic

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
import random

next_phase = dict(zip(
	['Last 16', 'Quarter-final', 'Semi-final'], 
	['Quarter-final', 'Semi-final', 'Final']
))

class TournamentConsumer(WebsocketConsumer):
	users = {}
	tournament = None
	games = {}
	has_started = False
	curr_phase = {
		'name': '',
		'num_games': 0,
		'finished_games': 0
	}
	# ! THIS ATTRIBUTES CAN'T STAY HERE AS THEY WILL BE SHARED AMONGST ALL 
	# ! EXISTING TOURNAMENTS ONGOING AT THE SAME TIME

	def connect(self):
		self.accept()
		self.user = self.scope['user']
		self.tournament_room = f'tournament_{self.scope["url_route"]["kwargs"]["tournament_id"]}'
		self.tournament_id = self.scope["url_route"]["kwargs"]["tournament_id"]
		# The first client will initialize the tournament variable
		if self.tournament is None:
			self.tournament = Tournaments.objects.get(pk=self.tournament_id)

		# Adding user to tournament-wide channel
		async_to_sync(self.channel_layer.group_add)(
			self.tournament_room, self.channel_name
		)
		if self.user.id not in self.users:
			self.add_new_tournament_user()

		ic(self.users)
		if not self.has_started and self.tournament is not None and len(self.users) == self.tournament.capacity:
			self.curr_phase['name'], self.curr_phase['num_games'], first_phase_games \
				= tournament_init_phase(self.tournament_id)
			self.begin_phase(first_phase_games)
			self.has_started = True
			

	def disconnect(self, code):
		#! IMPORTANT Use tournament_leave handler to remote the user from the database
		if self.user.id not in self.users:
			return

		del self.users[self.user.id]
		if len(self.users) == 0:
			self.reset()
		async_to_sync(self.channel_layer.group_discard)(self.tournament_room, self.channel_name)
		return super().disconnect(code)
	

	def receive(self, text_data):
		broadcast_handlers = {}
		message_handlers = {
			'FINISH': self.on_game_finish
		}
		
		message = json.loads(text_data)
		event = message['event']
	
		if event in broadcast_handlers:
			broadcast_handlers[event]()
		else:
			message_handlers[event](message['data'])

	def on_game_finish(self, data):
		ic('BEFORE', self.curr_phase)
		self.curr_phase['finished_games'] += 1
		if self.curr_phase['name'] == 'Final':
			temp = Tournaments.objects.get(pk=self.tournament_id).winner_id.id
			winner = TournamentsUsers.objects.get(tournament_id=self.tournament_id, user_id=temp)
			self.reset()

			async_to_sync(self.channel_layer.group_send)(self.tournament_room, {
				"type": "broadcast", 
				"message": json.dumps({
					"event": 'END_TOURNAMENT',
					"data": {
						'winner': TournamentsUsersSerializer(winner).data
					}
				})
			})

		elif self.curr_phase['finished_games'] == self.curr_phase['num_games']:
			self.curr_phase['name'] = next_phase[self.curr_phase['name']]
			self.curr_phase['num_games'] //= 2
			self.curr_phase['finished_games'] = 0
			curr_phase_games = TournamentsGames.objects.filter(
				tournament_id=self.tournament_id, phase=self.curr_phase['name']
			)

			#! Send the new user pairs for the next phase
			next_phase_users = []
			for tour_game in curr_phase_games:
				game = tour_game.game_id
				ic(game.id, game.user1_id.id, game.user2_id.id)
				tour_user1 = TournamentsUsers.objects.get(
					tournament_id=self.tournament_id, user_id=game.user1_id.id
				)
				tour_user2 = TournamentsUsers.objects.get(
					tournament_id=self.tournament_id, user_id=game.user2_id.id
				)
				user1 = Users.objects.get(pk=tour_user1.user_id.id) 
				user2 = Users.objects.get(pk=tour_user2.user_id.id) 
				tour_user1 = TournamentsUsersSerializer(tour_user1).data
				tour_user2 = TournamentsUsersSerializer(tour_user2).data
				tour_user1['user'] = UsersSerializer(user1).data
				tour_user2['user'] = UsersSerializer(user2).data
				next_phase_users.extend([tour_user1, tour_user2])

			async_to_sync(self.channel_layer.group_send)(self.tournament_room, {
				"type": "broadcast", 
				"message": json.dumps({
					"event": 'END_PHASE',
					"data": {
						'phase': self.curr_phase['name'].lower(),
						'players': next_phase_users
					}
				})
			})
			
			self.begin_phase(curr_phase_games)

		ic('AFTER', self.curr_phase)
				
	def add_new_tournament_user(self):
		# Add the user to the users list
		self.users[self.user.id] = {
			'id': self.user.id,
			'username': self.scope['user'].username,
			'channel_name': self.channel_name,
			'game_room': '',
			'ready_to_play': False,
		}

		# Gather info about the current tournament users
		all_tour_users = TournamentsUsers.objects.filter(tournament_id=self.tournament_id)
		serializer = TournamentsUsersSerializer(all_tour_users, many=True)

		tour_users_data = serializer.data

		for tour_user in tour_users_data:
			user = Users.objects.get(pk=tour_user['user_id']) 
			user_data = UsersSerializer(user).data
			tour_user['user'] = user_data

		# Broadcast current list to all users
		async_to_sync(self.channel_layer.group_send)(self.tournament_room, {
			"type": "broadcast", 
			"message": json.dumps({
				"event": 'USER_JOINED',
				"data": tour_users_data
			})
		})

	def begin_phase(self, phase_games):
		# And now pair up the players in their rooms
		for tour_game in phase_games:
			user1 = self.users[tour_game.game_id.user1_id.id]
			user2 = self.users[tour_game.game_id.user2_id.id]

			game_room = f'tournament_{self.tournament_id}_game_{tour_game.id}'
			user1['game_room'] = user2['game_room'] = game_room

			async_to_sync(self.channel_layer.group_add)(game_room, user1['channel_name'])
			async_to_sync(self.channel_layer.group_add)(game_room, user2['channel_name'])

			tournament_data = TournamentsGamesSerializer(tour_game).data
			tournament_data['game_id'] = GamesSerializer(tour_game.game_id).data
			tournament_data['user1_id'] = UsersSerializer(tour_game.game_id.user1_id).data
			tournament_data['user2_id'] = UsersSerializer(tour_game.game_id.user2_id).data
			tournament_data['phase'] = self.curr_phase['name'].lower()

			ic(game_room)
			async_to_sync(self.channel_layer.group_send)(game_room, {
				"type": "broadcast", 
				"message": json.dumps({
					'event': 'BEGIN_PHASE',
					'data': tournament_data
				})
			})

	def reset(self):
		self.games.clear()
		self.users.clear()
		self.tournament = None
		self.has_started = False
		self.curr_phase = {
			'name': '',
			'num_games': 0,
			'finished_games': 0
		}

	def broadcast(self, event):		
		self.send(text_data=event["message"])

	
class TournamentGameConsumer(WebsocketConsumer):
	gameClients = set()

	def connect(self):
		self.accept()
		self.user = self.scope['user']
		self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
		self.tournament_id = self.scope["url_route"]["kwargs"]["tournament_id"]
		self.room_name = f'tour_{self.tournament_id}_game_{self.game_id}'

		async_to_sync(self.channel_layer.group_add)(self.room_name, self.channel_name)

		if self.game_id not in self.gameClients:
			self.gameClients.add(self.game_id)
		else:
			self.gameClients.remove(self.game_id)
			async_to_sync(self.channel_layer.group_send)(
				self.room_name, {
					"type": "send.start.game.message", 
					"message": json.dumps({
						'event': 'START',
						'data': {}
					})
				}
			)

	def disconnect(self, code):
		return super().disconnect(code)
	
	def receive(self, text_data=None):
		handlers = {
			'UPDATE': 'send.update.paddle.message',
			'SYNC': 'send.ball.sync.message',
			'FINISH': 'send.end.game.message'
		}
		data = json.loads(text_data)
		event = data['event']

		if event == 'FINISH':
			game_data = data['data']
			del game_data['id']
			tournament_update_game_helper(self.tournament_id, self.game_id, game_data)

		async_to_sync(self.channel_layer.group_send)(
			self.room_name, {
				"type": handlers[event], 
				"message": text_data
			}
		)

	def send_start_game_message(self, event):
		self.send(event['message'])

	def send_ball_sync_message(self, event):
		self.send(event['message'])
		
	def send_update_paddle_message(self, event):
		self.send(event['message'])

	def send_end_game_message(self, event):
		self.send(event['message'])


class RemoteGameQueueConsumer(WebsocketConsumer):
	queue = {}

	def connect(self):
		self.accept()
		self.user = self.scope['user']
		self.room_name = ''
		self.game_id = 0

		if self.user.id in self.queue:
			return

		if len(self.queue) == 0:
			self.add_player_to_queue()
		else:
			self.add_player_to_waiting_room()

	def add_player_to_queue(self):
		""" 
		This will add the new player to the queue and also create a channel group
		(a 'waiting room') to allow another player to join in
		"""
		self.room_name = "room_%s" % self.user.id

		self.queue[self.user.id] = {
			'id': self.user.id,
			'username': self.scope['user'].username,
			'room_name': self.room_name
		}
		async_to_sync(self.channel_layer.group_add)(self.room_name, self.channel_name)

	def add_player_to_waiting_room(self):
		""" 
		Since the queue is not empty, this means there is already at least
		1 waiting room. We add the current player to the waiting room and 
		send a START command to initiate the game. This also removes the 
		waiting room from the queue.
		"""

		host_id = list(self.queue.keys())[0]
		host_player = self.queue[host_id]
		self.room_name = host_player['room_name']
		curr_player = {
			'id': self.user.id,
			'username': self.scope['user'].username,
			'room_name': self.room_name
		}

		new_game_data = {
		    "user1_id": host_id,
		    "user2_id": self.user.id,
		    "type": "Remote"
		}

		new_game = json.loads(game_create_helper(new_game_data).content)
		async_to_sync(self.channel_layer.group_add)(host_player['room_name'], self.channel_name)
		async_to_sync(self.channel_layer.group_send)(
			self.room_name, {
				"type": "send.start.game.message", 
				"message": json.dumps({
					'gameID': new_game['id'],
					'player1': host_player,
					'player2': curr_player,
					'ball': {
						'direction': {
							'x': 1 if random.randint(0, 1) == 1 else -1,
							'y': 1 if random.randint(0, 1) == 1 else -1
						}
					}
				})
			}
		)
		del self.queue[host_id]

	def disconnect(self, code):
		if self.user.id in self.queue:
			del self.queue[self.user.id]
		return super().disconnect(code)
	
	def receive(self, text_data=None):
		handlers = {
			'UPDATE': 'send.update.paddle.message',
			'SYNC': 'send.ball.sync.message',
			'FINISH': 'send.end.game.message'
		}
		data = json.loads(text_data)
		event = data['event']

		if event == 'FINISH':
			game_data = data['data']
			game_id = game_data['id']
			del game_data['id']
			game_update_helper(data['data'], game_id)

		async_to_sync(self.channel_layer.group_send)(
			self.room_name, {
				"type": handlers[event], 
				"message": text_data
			}
		)

	def send_start_game_message(self, event):
		self.send(event['message'])

	def send_ball_sync_message(self, event):
		self.send(event['message'])
		
	def send_update_paddle_message(self, event):
		self.send(event['message'])

	def send_end_game_message(self, event):
		self.send(event['message'])
