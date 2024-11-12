from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from ..views import tournament_update_game_helper

from icecream import ic
import json

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