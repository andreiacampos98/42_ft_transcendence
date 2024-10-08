import json
from .models import TournamentsUsers, Users
from .serializers import TournamentsUsersSerializer, UsersSerializer
from icecream import ic

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
import random


class TournamentConsumer(WebsocketConsumer):
	def connect(self):
		self.room_group_name = f'{self.scope["url_route"]["kwargs"]["tournament_id"]}'

		async_to_sync(self.channel_layer.group_add)(
			self.room_group_name, self.channel_name
		)

		self.accept()

	def disconnect(self, code):
		async_to_sync(self.channel_layer.group_discard)(
			self.room_group_name, self.channel_name
		)
		return super().disconnect(code)
	
	def receive(self, text_data):
		tournament_id = self.room_group_name
		all_tour_users = TournamentsUsers.objects.filter(tournament_id=tournament_id)
		serializer = TournamentsUsersSerializer(all_tour_users, many=True)

		tour_users_data = serializer.data

		for tour_user in tour_users_data:
			user = Users.objects.get(pk=tour_user['user_id']) 
			user_data = UsersSerializer(user).data
			tour_user['user'] = user_data

		async_to_sync(self.channel_layer.group_send)(
			self.room_group_name, {"type": "send.users", "message": json.dumps(tour_users_data)}
		)

	def send_users(self, event):
		self.send(text_data=event["message"])
		

class RemoteGameQueueConsumer(WebsocketConsumer):
	queue = {}

	def connect(self):
		self.accept()
		self.user = self.scope['user']
		self.room_name = ''

		if len(self.queue) == 0:
			ic('adding player to queue')
			self.add_player_to_queue()
		else:
			ic('adding player to waiting room')
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
		
		async_to_sync(self.channel_layer.group_add)(host_player['room_name'], self.channel_name)
		async_to_sync(self.channel_layer.group_send)(
			self.room_name, {
				"type": "send.start.game.message", 
				"message": json.dumps({
					'player1': curr_player,
					'player2': host_player,
					'direction': {
						'x': 1 if random.randint(0, 1) == 1 else -1,
						'y': 1 if random.randint(0, 1) == 1 else -1
					}
				})
			}
		)
		del self.queue[host_id]

	def disconnect(self, code):
		del self.queue[self.user.id]
		return super().disconnect(code)
	
	def receive(self, text_data=None):
		async_to_sync(self.channel_layer.group_send)(
			self.room_name, {
				"type": "send.update.paddle.message", 
				"message": text_data
			}
		)

	def send_start_game_message(self, event):
		self.send(event['message'])
		
	def send_update_paddle_message(self, event):
		data = json.loads(event['message'])
		ic(data)
		if data['id'] != self.user.id:
			self.send(event['message'])

	

			


# if the queue is empty: (no room available)
#	- create a new channel_name and add it to the object
# 	- push the new object alongside the channel name to the queue
# else: (available rooms)
# 	- Pop the first available room in the queue
#	- Add the client to the room
# 	- Broadcast a message to the channel with a starting command

# If receive() function is triggered:
#	- Create a new object with the position of the paddle of the player who sent it
#	- Send position to the other player


				