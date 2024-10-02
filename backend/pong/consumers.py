import json
from .models import TournamentsUsers, Users
from .serializers import TournamentsUsersSerializer, UsersSerializer
from icecream import ic

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


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
		self.room_group_name = "Remote Game Queue"
		self.accept()

	def disconnect(self, code):
		del self.queue[self.scope['user'].id]
		ic(self.queue)
		return super().disconnect(code)
	
	def receive(self, text_data=None):
		user_id = self.scope['user'].id
		self.queue[user_id] = self.scope['client']
		ic(self.queue)
