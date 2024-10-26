import json
from .views import game_create_helper, game_update_helper, tournament_init_phase
from .models import Tournaments, TournamentsUsers, Users
from .serializers import GamesSerializer, TournamentsGamesSerializer, TournamentsUsersSerializer, UsersSerializer
from icecream import ic

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
import random


class TournamentConsumer(WebsocketConsumer):
	users = {}
	tournament_id = 0
	tournament = None
	games = {}

	def connect(self):
		self.accept()
		self.user = self.scope['user']
		self.game_room = ''
		self.tournament_room = f'{self.scope["url_route"]["kwargs"]["tournament_id"]}'
		
		# Get the tournament info
		if self.tournament is None and self.tournament_id == 0:
			self.tournament_id = self.scope["url_route"]["kwargs"]["tournament_id"]
			self.tournament = Tournaments.objects.get(pk=self.tournament_id)

		# Adding user to tournament-wide channel
		async_to_sync(self.channel_layer.group_add)(
			self.tournament_room, self.channel_name
		)

		self.update_tournament_users()

		if self.tournament is not None and len(self.users) == self.tournament.capacity:
			first_phase_games = tournament_init_phase(self.tournament_id)
			ic(first_phase_games)
			self.link_user_rooms(first_phase_games)
			

	def disconnect(self, code):
		# Use tournament_leave handler to remote the user from the database
		if self.user.id not in self.users:
			return 
	
		async_to_sync(self.channel_layer.group_discard)(self.tournament_room, self.channel_name)

		del self.users[self.user.id]
		return super().disconnect(code)
	
	def receive(self, text_data):
		# handlers = {
		# 	# 'UPDATE': 'send.update.paddle.message',
		# 	# 'SYNC': 'send.ball.sync.message',
		# 	# 'FINISH': 'send.end.game.message',
		# }
		# message = json.loads(text_data)
		# event = message['event']
	
		# handlers[event]()
		pass
		
	def update_tournament_users(self):
		tournament_id = self.tournament_room
		all_tour_users = TournamentsUsers.objects.filter(tournament_id=tournament_id)
		serializer = TournamentsUsersSerializer(all_tour_users, many=True)

		tour_users_data = serializer.data

		for tour_user in tour_users_data:
			user = Users.objects.get(pk=tour_user['user_id']) 
			user_data = UsersSerializer(user).data
			tour_user['user'] = user_data

		# Broadcast current list to all users
		async_to_sync(self.channel_layer.group_send)(
			self.tournament_room, {"type": "send.users", "message": json.dumps(tour_users_data)}
		)

		# Add the user to the users list
		self.users[self.user.id] = {
			'id': self.user.id,
			'username': self.scope['user'].username,
			'channel_name': self.channel_name,
			'game_room': ''
		}

	def link_user_rooms(self, phase_games):
		for tour_game in phase_games:
			user1 = self.users[tour_game.game_id.user1_id.id]
			user2 = self.users[tour_game.game_id.user2_id.id]

			game_room = f'tournament_game_{tour_game.id}'
			user1['game_room'] = user2['game_room'] = game_room

			async_to_sync(self.channel_layer.group_add)(game_room, user1['channel_name'])
			async_to_sync(self.channel_layer.group_add)(game_room, user2['channel_name'])

			tournament_data = TournamentsGamesSerializer(tour_game).data
			tournament_data['game_id'] = GamesSerializer(tour_game.game_id).data

			async_to_sync(self.channel_layer.group_send)(game_room, {
				"type": "send.something", 
				"message": json.dumps(tournament_data)
			})

	def send_users(self, event):
		self.send(text_data=event["message"])

	def send_something(self, event):
		self.send(text_data=event["message"])
		
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
		ic(self.queue)

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