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
		self.game_channel = ''
		self.has_opponent_disconnected = False

		await self.queue_up()
		for key in self.get_game_queue():
			ic(key, self.get_waiting_room(key))
	
	async def disconnect(self, code):
		self.del_waiting_room(self.user.id)
		if self.game_channel:
			await self.channel_layer.group_send( self.game_channel, {
				"type": "signal.disconnection",
				"message": {}
			})
		for key in self.get_game_queue():
			ic(key, self.get_waiting_room(key))
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
	
	async def broadcast_and_set_channel(self, event):
		data = json.loads(event['message'])
		self.game_channel = f'remote_game_{data['gameID']}'
		await self.send(event['message'])
	
	async def signal_disconnection(self, event):
		self.has_opponent_disconnected = True
		
	# ! ============================= REDIS ACCESS =============================
	
	def get_game_queue(self):
		return [json.loads(key.decode('UTF-8')) for key in self.redis.hgetall('remote_game_queue')]

	def get_waiting_room(self, key):
		return json.loads(self.redis.hget('remote_game_queue', key).decode('UTF-8'))

	def set_waiting_room(self, key, value):
		return self.redis.hset('remote_game_queue', key, json.dumps(value))

	def del_waiting_room(self, key):
		return self.redis.hdel('remote_game_queue', key)
	
	def get_game_results(self, key):
		data = self.redis.hget('remote_game_results', key)
		return json.loads(data.decode('UTF-8')) if data is not None else None
	
	def set_game_results(self, key, value):
		return self.redis.hset('remote_game_results', key, json.dumps(value))

	def del_game_results(self, key):
		return self.redis.hdel('remote_game_results', key)

	# ! ============================= DATABASE ACCESS ==========================

	@database_sync_to_async
	def on_game_end(self, data):
		game_id = data['id']
		game_results = self.get_game_results(game_id)
		
		if game_results is not None:
			ic(f'Data for game {game_id} already exists, {self.user.username}')
			ic(game_results)
			game_update_helper(game_results, game_id)
			self.del_game_results(game_id)
		else:
			ic(f'Storing game {game_id} with {self.user.username} data...')
			del data['id']
			self.set_game_results(game_id, data)

		if game_results is None and self.has_opponent_disconnected:
			ic(f'Opponent of {self.user.username} disc. Updating game {game_id}')
			game_update_helper(data, game_id)
			self.del_game_results(game_id)
		
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

		available_rooms = self.get_game_queue()
		for key in available_rooms:
			ic(key, self.get_waiting_room(key))
		if self.user.id in available_rooms:
			ic(f'{self.user.id} - {self.user.username} already in the waiting rooms')
			return
		if self.redis.hlen('remote_game_queue') > 0:
			ic(f'Pairing {self.user.id} - {self.user.username}')
			await self.pair_player(available_rooms[0])
		else:
			ic(self.user.picture)
			ic(self.user.picture.url)
			user_data = {
				'id': self.user.id,
				'username': self.scope['user'].username,
				'channel_name': self.channel_name,
				'picture': self.user.picture.url,
			}
			self.set_waiting_room(self.user.id, user_data)


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
			'picture': self.user.picture.url
		}
		host_player = self.get_waiting_room(host_room_id)
		game = await self.create_new_game(host_player['id'])

		# ! I HAVE TO CHANGE THE GAME CHANNEL OF BOTH HOST AND CLIENT
		self.game_channel = f'remote_game_{game['id']}'
		self.game_id = game['id']

		await self.channel_layer.group_add(self.game_channel, self.channel_name)
		await self.channel_layer.group_add(self.game_channel, host_player['channel_name'])
		await self.channel_layer.group_send(self.game_channel, {"type": "broadcast.and.set.channel", 
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
		self.del_waiting_room(host_player['id'])
