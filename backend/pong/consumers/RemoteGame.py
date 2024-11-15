from ..views import game_create_helper, game_update_helper

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

import json
import random
from icecream import ic

class RemoteGameQueueConsumer(AsyncWebsocketConsumer):
	queue = {}

	async def connect(self):
		await self.accept()
		self.user = self.scope['user']
		self.game_channel = ''
		self.game_id = 0

		if self.user.id in self.queue:
			return

		if len(self.queue) == 0:
			await self.queue_up()
		else:
			await self.pair_player()

	
	async def disconnect(self, code):
		if self.user.id in self.queue:
			del self.queue[self.user.id]
		return await super().disconnect(code)
	
	async def receive(self, text_data=None):
		data = json.loads(text_data)
		event = data['event']

		if event == 'GAME_END':
			await self.on_game_end(data)

		await self.channel_layer.group_send( self.game_channel, {
			"type": "broadcast",
			"message": text_data
		})

	async def broadcast(self, event):
		await self.send(event['message'])

	@database_sync_to_async
	def on_game_end(self, data):
		ic(data)
		game_data = data['data']
		game_id = game_data['id']
		del game_data['id']
		game_update_helper(data['data'], game_id)
	
	@database_sync_to_async
	def create_new_game(self, host_id):
		new_game_data = {
		    "user1_id": host_id,
		    "user2_id": self.user.id,
		    "type": "Remote"
		}

		new_game = json.loads(game_create_helper(new_game_data).content)

		return new_game 

	async def queue_up(self):
		""" 
		This will add the new player to the queue and also create a channel group
		(a 'waiting room') to allow another player to join in
		"""

		self.queue[self.user.id] = {
			'id': self.user.id,
			'username': self.scope['user'].username,
			'game_channel': self.game_channel,
			'channel_name': self.channel_name
		}

		self.game_channel = f'remote_game_host_{self.user.id}'

	async def pair_player(self):
		""" 
		Since the queue is not empty, this means there is already at least
		1 waiting room. We add the current player to the waiting room and 
		send a START command to initiate the game. This also removes the 
		waiting room from the queue.
		"""

		curr_player = {
			'id': self.user.id,
			'username': self.scope['user'].username,
			'game_channel': self.game_channel
		}

		host_id = list(self.queue.keys())[0]
		host_player = self.queue[host_id]
		game = await self.create_new_game(host_id)

		self.game_channel = f'remote_game_host_{host_id}'

		await self.channel_layer.group_add(self.game_channel, self.channel_name)
		await self.channel_layer.group_add(self.game_channel, host_player['channel_name'])
		await self.channel_layer.group_send(self.game_channel, {
			"type": "broadcast", 
			"message": json.dumps({
				'gameID': game['id'],
				'player1': host_player,
				'player2': curr_player,
				'ball': {
					'direction': {
						'x': 1 if random.randint(0, 1) == 1 else -1,
						'y': 1 if random.randint(0, 1) == 1 else -1
					}
				}
			})
		})
		del self.queue[host_id]
