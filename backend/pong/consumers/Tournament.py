import json
from ..views import tournament_init_phase, tournament_leave, tournament_update_game_helper
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
	
	async def connect(self):
		await self.accept()
		self.user = self.scope['user']
		self.redis = get_redis_connection('default')
		self.tournament_id = self.scope["url_route"]["kwargs"]["tournament_id"]
		self.tournament_channel = f'tournament_{self.tournament_id}'
		self.tournament_capacity = (await self.get_tournament()).capacity

		# Add user to the tournament wide channel
		await self.channel_layer.group_add(self.tournament_channel, self.channel_name)

		# Create cache in redis about tournament (if it does not exist) and about the user
		await self.create_cache()
		await self.broadcast_player_list()

		if self.is_tournament_full():
			first_phase = self.get_cache(self.tournament_channel)['curr_phase']
			await self.begin_phase(first_phase, True)
		

	async def disconnect(self, code):
		# Remove the player from cache
		players = self.get_cache(f'{self.tournament_channel}_players')
		player_id = f'{self.user.id}'

		if player_id in players:			
			del players[player_id]
			self.set_cache(f'{self.tournament_channel}_players', players)
		
		# Remove the tournament while the tournament hasn't started yet
		tournament = await self.get_tournament()
		
		if tournament.status == 'Open':
			await tournament_leave(self.tournament_id, self.user.id)
			ic(f'LEFT: {self.user.username} from tournament {tournament.id} while "{tournament.status}"')

			players = list(map(lambda x: x['tour_user'], players.values()))

			await self.channel_layer.group_send(self.tournament_channel, {
				"type": "broadcast", 
				"message": json.dumps({
					'event': 'PLAYER_LEFT',
					'data': {
						'players': players
					}
				})
			})

		ic(f'DISCONNECT: {self.user.username} from tournament {tournament.id} while "{tournament.status}"')
		
		return await super().disconnect(code)
	

	async def receive(self, text_data):
		message = json.loads(text_data)
		event = message['event']

		if event == 'GAME_END':
			await self.on_game_end(message['data'])
		elif event == 'LEAVE':
			tournament = await self.get_tournament()
			await self.leave_tournament(tournament)

	# ! ============================== MESSAGING ===============================

	async def broadcast(self, event):		
		await self.send(text_data=event["message"])
	
	# ! ============================= REDIS ACCESS =============================

	def get_cache(self, key):
		data = self.redis.get(key)
		return json.loads(data.decode('UTF-8')) if data else None
	
	def set_cache(self, key, value):
		return self.redis.set(key, json.dumps(value))
	
	async def create_cache(self):
		tournament_state = {
			'last_phase': None, 
			'curr_phase': phase_of[self.tournament_capacity],
			'curr_phase_total_games': self.tournament_capacity // 2,
			'curr_phase_finished_games': 0
		}

		if not self.redis.exists(self.tournament_channel):
			self.set_cache(self.tournament_channel, tournament_state)

		tournament_games = {
			'Last 16': {},
			'Quarter-final': {},
			'Semi-final': {},
			'Final': {},
		}
		if not self.redis.exists(f'{self.tournament_channel}_games'):
			self.set_cache(f'{self.tournament_channel}_games', tournament_games)

		tour_user = await self.get_tournament_user(self.user.id)

		tournament_users_data = self.get_cache(f'{self.tournament_channel}_players')
		if tournament_users_data is None:
			tournament_users_data = {}

		tournament_users_data[self.user.id] = {
			'id': self.user.id,
			'username': self.user.username,
			'channel_name': self.channel_name,
			'game_channel': '',
			'tour_user': tour_user,
			'has_finished_playing': False
		}
		self.set_cache(f'{self.tournament_channel}_players', tournament_users_data)

	# ! ============================= DATABASE ACCESS ==========================

	async def leave_tournament(self, tournament):
		if tournament.status == 'Open':
			await tournament_leave(self.tournament_id, self.user.id)
			ic(f'LEFT: {self.user.username} from tournament {tournament.id} while "{tournament.status}"')

			players = self.get_cache(f'{self.tournament_channel}_players')
			del players[f'{self.user.id}']
			self.set_cache(f'{self.tournament_channel}_players', players)

			players_data = list(map(lambda x: x['tour_user'], players.values()))

			await self.channel_layer.group_send(self.tournament_channel, {
				"type": "broadcast", 
				"message": json.dumps({
					'event': 'PLAYER_LEFT',
					'data': {
						'players': players_data
					}
				})
			})

		ic(f'DISCONNECT: {self.user.username} from tournament {tournament.id} while "{tournament.status}"')
		await super().disconnect()


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
	def get_tournament_phase_games(self, phase, is_first_phase):
		if is_first_phase:
			return tournament_init_phase(self.tournament_id)
		else:
			return TournamentsGames.objects.filter(
				tournament_id=self.tournament_id, phase=phase
			)

	async def create_game_channels(self, games, players):
		players_data = []
		for tour_game in games:
			p1 = players[f'{tour_game.game_id.user1_id.id}']
			p2 = players[f'{tour_game.game_id.user2_id.id}']

			game_channel = f'{self.tournament_channel}_game_{tour_game.id}'
			p1['game_channel'] = p2['game_channel'] = game_channel
			p1['has_finished_playing'] = p2['has_finished_playing'] = False 
			
			await self.channel_layer.group_add(game_channel, p1['channel_name'])
			await self.channel_layer.group_add(game_channel, p2['channel_name'])

			players_data.extend([p1['tour_user'], p2['tour_user']])
		
		self.set_cache(f'{self.tournament_channel}_players', players)
		return players_data

	@database_sync_to_async
	def serialize_phase_games(self, games, phase):
		games_data = []

		for tour_game in games:
			game_data = TournamentsGamesSerializer(tour_game).data
			game_data['game_id'] = GamesSerializer(tour_game.game_id).data
			game_data['user1_id'] = UsersSerializer(tour_game.game_id.user1_id).data
			game_data['user2_id'] = UsersSerializer(tour_game.game_id.user2_id).data
			game_data['phase'] = phase.lower()
			games_data.append(game_data)

		return games_data
	
	
	@database_sync_to_async
	def store_last_phase_results(self, phase):
		tournament_games = self.get_cache(f'{self.tournament_channel}_games')

		ic('UPDATING GAMES')
		for game_id, game_data in tournament_games[phase].items():
			tournament_update_game_helper(self.tournament_id, game_id, game_data)

		games = TournamentsGames.objects.filter(tournament_id=self.tournament_id, phase=phase)

		last_phase_scores = []
		for tour_game in games:
			game_data = {
				'id': tour_game.game_id.id,
				'username1': tour_game.game_id.user1_id.username,
				'username2': tour_game.game_id.user2_id.username,
				'score1': tour_game.game_id.nb_goals_user1,
				'score2': tour_game.game_id.nb_goals_user2,
			}
			last_phase_scores.append(game_data)

		winner = None
		if phase == 'Final':
			user = Tournaments.objects.get(pk=self.tournament_id).winner_id
			winner = TournamentsUsers.objects.get(tournament_id=self.tournament_id, user_id=user.id)
			winner = TournamentsUsersSerializer(winner).data
			winner['user'] = UsersSerializer(user).data

		return last_phase_scores, winner
	

	# ! ===========================================================================

	def is_tournament_full(self):
		tournament_users = self.get_cache(f'{self.tournament_channel}_players')
		return len(tournament_users) == self.tournament_capacity


	async def broadcast_player_list(self):
		curr_phase = self.get_cache(self.tournament_channel)['curr_phase']
		players = self.get_cache(f'{self.tournament_channel}_players')
		users_data = list(map(lambda x: x['tour_user'], players.values()))

		# Broadcast current list to all users
		await self.channel_layer.group_send(self.tournament_channel, {
			"type": "broadcast", 
			"message": json.dumps({
				'event': 'PLAYER_JOINED',
				'data': {
					'phase': curr_phase.lower(),
					'players': users_data
				}
			})
		})


	async def on_game_end(self, game_data):
		players = self.get_cache(f'{self.tournament_channel}_players')
		curr_phase = self.get_cache(self.tournament_channel)['curr_phase']
		tournament_games = self.get_cache(f'{self.tournament_channel}_games')

		game_id = f'{game_data['id']}'

		if game_id in tournament_games[curr_phase]:
			ic(f'Data for game {game_id} ({curr_phase}) already exists')
			ic(tournament_games[curr_phase][game_id])
		else:
			ic(f'Storing game {game_id} ({curr_phase}) data...')
			del game_data['id']
			tournament_games[curr_phase][game_id] = game_data
			self.set_cache(f'{self.tournament_channel}_games', tournament_games)

		me = players[f'{self.user.id}']
		me['has_finished_playing'] = True
		self.set_cache(f'{self.tournament_channel}_players', players)

		all_players_confirmed = all([p['has_finished_playing'] for p in players.values()])
		if all_players_confirmed:
			await self.end_phase()

			if curr_phase != 'Final' and not None: 
				await self.begin_phase(phase_after[curr_phase])
			

	async def begin_phase(self, phase, is_first_phase=False):
		games = await self.get_tournament_phase_games(phase, is_first_phase)

		curr_phase = self.get_cache(self.tournament_channel)['curr_phase']
		players = self.get_cache(f'{self.tournament_channel}_players')

		games_data = await self.serialize_phase_games(games, curr_phase)
		players_data = await self.create_game_channels(games, players)

		players = {k:v for k,v in players.items() if not v['has_finished_playing']}
		self.set_cache(f'{self.tournament_channel}_players', players)
	
		await self.channel_layer.group_send(self.tournament_channel, {
			"type": "broadcast", 
			"message": json.dumps({
				'event': 'PHASE_START',
				'data': {
					'phase': curr_phase.lower(),
					'games': games_data,
					'players': players_data
				}
			})
		})

	async def end_phase(self):
		# Update the phase
		tournament_state = self.get_cache(self.tournament_channel)
		tournament_state['last_phase'] = tournament_state['curr_phase']
		tournament_state['curr_phase'] = phase_after[tournament_state['last_phase']]
		tournament_state['curr_phase_total_games'] //= 2
		tournament_state['curr_phase_finished_games'] = 0
		self.set_cache(self.tournament_channel, tournament_state)
		
		ic('PHASE_END', tournament_state)

		results, winner = await self.store_last_phase_results(tournament_state['last_phase']) 

		await self.channel_layer.group_send(self.tournament_channel, {
			"type": "broadcast", 
			"message": json.dumps({
				"event": 'PHASE_END',
				"data": {
					'phase': tournament_state['last_phase'].lower(),
					'next_phase': tournament_state['curr_phase'].lower() if tournament_state['curr_phase'] else None,
					'results': results,
					'winner': winner,
				}
			})
		})
