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
		self.host_channel = f'room_of_host_{self.user.id}'

		await self.queue_up()
	
	async def disconnect(self, code):
		if self.user.id in self.queue:
			del self.queue[self.user.id]
		return await super().disconnect(code)
	
	async def receive(self, text_data=None):
		message = json.loads(text_data)
		event = message['event']

		if event == 'GAME_END':
			await self.on_game_end(message['data'])

		await self.channel_layer.group_send( self.host_channel, {
			"type": "broadcast",
			"message": text_data
		})

	# ! ============================== MESSAGING ===============================

	async def broadcast(self, event):
		await self.send(event['message'])

	# ! ============================= REDIS ACCESS =============================

	def get_cache(self, key):
		data = self.redis.get(key)
		return json.loads(data.decode('UTF-8')) if data else None
	
	def set_cache(self, key, value):
		return self.redis.set(key, json.dumps(value))

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

		# ! WAS IN THE MIDDLE OF PLACING GAMES IN REDIS BUT NOTICED
		# ! THAT IT'S BETTER IF I DONT REPLACE THE WHOLE CACHE WHEN A GAME IS 
		# ! ELIMINATED. SO THE BEST COURSE IS TO CREATE A VARIABLE WITH THE KEYS
		# ! FOR THE REMOTE GAMES AND CREATE KEY VALUES FOR EACH GAME

		# ! EXAMPLE
		# ! 'remote_games_available': ['remote_host_1', 'remote_host_2', 'remote_host_3']
		# ! 'remote_host_1': {...}
		# ! 'remote_host_2': {...}
		# ! 'remote_host_3': {...}
		# ! PAIR WITH SOMEONE AND REMOVE IT FROM THE CACHE AND THE 'remote_games_available'


		queue = {}
		if self.redis.exists('remote_games_queue'):
			queue = self.get_cache('remote_games_queue')
		if self.user.id in queue:
			return
		if len(queue) != 0:
			return await self.pair_player(queue)

		queue[self.user.id] = {
			'id': self.user.id,
			'username': self.scope['user'].username,
			'game_channel': self.host_channel,
			'channel_name': self.channel_name
		}
		
		self.set_cache('remote_games_queue', queue)

	async def pair_player(self, queue):
		""" 
		Since the queue is not empty, this means there is already at least
		1 waiting room. We add the current player to the waiting room and 
		send a START command to initiate the game. This also removes the 
		waiting room from the queue.
		"""

		curr_player = {
			'id': self.user.id,
			'username': self.scope['user'].username,
			'game_channel': self.host_channel
		}

		host_id = list(queue.keys())[0]
		host_player = queue[host_id]
		game = await self.create_new_game(host_id)

		self.host_channel = f'remote_game_host_{host_id}'

		await self.channel_layer.group_add(self.host_channel, self.channel_name)
		await self.channel_layer.group_add(self.host_channel, host_player['channel_name'])
		await self.channel_layer.group_send(self.host_channel, {
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
		del queue[host_id]
		self.set_cache('remote_games_queue', queue)
