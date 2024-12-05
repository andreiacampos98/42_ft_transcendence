from channels.generic.websocket import AsyncWebsocketConsumer
from icecream import ic
import json



class TournamentGameConsumer(AsyncWebsocketConsumer):
	gameClients = set()

	async def connect(self):
		await self.accept()
		self.user = self.scope['user']
		self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
		self.tournament_id = self.scope["url_route"]["kwargs"]["tournament_id"]
		self.game_channel = f'tour_{self.tournament_id}_game_{self.game_id}'

		await self.channel_layer.group_add(self.game_channel, self.channel_name)

		if self.game_id not in self.gameClients:
			self.gameClients.add(self.game_id)
		else:
			self.gameClients.remove(self.game_id)
			await self.channel_layer.group_send(self.game_channel, {
				"type": "broadcast", 
				"message": json.dumps({
					'event': 'GAME_START',
					'data': {}
				})
			})

	async def disconnect(self, code):
		return await super().disconnect(code)
	
	async def receive(self, text_data=None):
		# message = json.loads(text_data)

		await self.channel_layer.group_send(self.game_channel, {
			"type": "broadcast",
			"message": text_data
		})

	# ! ============================== MESSAGING ===============================

	async def broadcast(self, event):		
		await self.send(text_data=event["message"])

	# ! ============================= DATABASE ACCESS ==========================

	# async def on_timeout(self):
