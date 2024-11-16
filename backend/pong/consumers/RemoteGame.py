from ..views import game_create_helper, game_update_helper

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django_redis import get_redis_connection

import json
import random
from icecream import ic

class RemoteGameQueueConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		await self.accept()
		self.user = self.scope['user']
		self.redis = get_redis_connection('default')
		self.game_channel = f'room_of_host_{self.user.id}'

		await self.queue_up()
	
	async def disconnect(self, code):
		# if self.user.id in self.queue:
		# 	del self.queue[self.user.id]
		self.hashmap_del_cache(self.user.id)
		for key in self.hashmap_getall_cache():
			ic(key, self.hashmap_get_cache(key))
		return await super().disconnect(code)
	
	async def receive(self, text_data=None):
		message = json.loads(text_data)
		event = message['event']

		if event == 'GAME_END':
			await self.on_game_end(message['data'])

		await self.channel_layer.group_send( self.game_channel, {
			"type": "broadcast",
			"message": text_data
		})

	# ! ============================== MESSAGING ===============================

	async def broadcast(self, event):
		await self.send(event['message'])

	# ! ============================= REDIS ACCESS =============================
	
	def hashmap_getall_cache(self):
		return [json.loads(key.decode('UTF-8')) for key in self.redis.hgetall('remote_game_queue')]

	def hashmap_get_cache(self, key):
		return json.loads(self.redis.hget('remote_game_queue', key).decode('UTF-8'))

	def hashmap_set_cache(self, key, value):
		return self.redis.hset('remote_game_queue', key, json.dumps(value))

	def hashmap_del_cache(self, key):
		return self.redis.hdel('remote_game_queue', key)

	# ! ============================= DATABASE ACCESS ==========================

	@database_sync_to_async
	def on_game_end(self, data):
		game_id = data['id']
		del data['id']
		game_update_helper(data['data'], game_id)
	
	@database_sync_to_async
	def create_new_game(self, host_id):
		new_game_data = {
		    "user1_id": host_id,
		    "user2_id": self.user.id,
		    "type": "Remote"
		}

		return json.loads(game_create_helper(new_game_data).content)

	# ! ===========================================================================


	async def queue_up(self):
		""" 
		This will add the new player to the queue and also create a channel group
		(a 'waiting room') to allow another player to join in
		"""

		available_rooms = self.hashmap_getall_cache()
		for key in available_rooms:
			ic(key, self.hashmap_get_cache(key))
		if self.user.id in available_rooms:
			ic(f'{self.user.id} - {self.user.username} already in the waiting rooms')
			return
		if self.redis.hlen('remote_game_queue') > 0:
			ic(f'Pairing {self.user.id} - {self.user.username}')
			await self.pair_player(available_rooms[0])
		else:
			user_data = {
				'id': self.user.id,
				'username': self.scope['user'].username,
				'game_channel': self.game_channel,
				'channel_name': self.channel_name
			}
			self.hashmap_set_cache(self.user.id, user_data)


	async def pair_player(self, host_room_id):
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
		host_player = self.hashmap_get_cache(host_room_id)
		game = await self.create_new_game(host_player['id'])

		self.game_channel = host_player['game_channel']

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
		self.hashmap_del_cache(host_player['id'])
