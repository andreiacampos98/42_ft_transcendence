from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

from ..views import game_create_helper, game_update_helper

import json
import random
from icecream import ic

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