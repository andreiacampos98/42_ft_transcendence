import json
from .models import TournamentsUsers, Users
from .serializers import TournamentsUsersSerializer, UsersSerializer
from icecream import ic

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer


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

		if len(self.queue) == 0:
			user_id = self.scope['user'].id
			room_name = "room_%s" % user_id

			self.queue[user_id] = {
				'ip': self.scope['client'],
				'user_id': user_id,
				'username': self.scope['user'].username,
				'room_name': room_name
			}
			async_to_sync(self.channel_layer.group_add)(room_name, self.channel_name)
		else:
			other_id = ic(list(self.queue.keys())[0])
			other_user = self.queue[other_id]
			room_name = other_user['room_name']
			curr_user = {
				'ip': self.scope['client'],
				'user_id': self.scope['user'].id,
				'username': self.scope['user'].username,
				'room_name': room_name
			}
			async_to_sync(self.channel_layer.group_add)(other_user['room_name'], self.channel_name)
			async_to_sync(self.channel_layer.group_send)(
				room_name, {"type": "send.message", "message": json.dumps({
					'player1': curr_user, 
					'player2': other_user
				})}
			)


	def disconnect(self, code):
		del self.queue[self.scope['user'].id]
		ic(self.queue)
		return super().disconnect(code)
	
	def receive(self, text_data=None):
		pass

	def send_message(self, event):
		data = json.loads(event["message"])
		curr_username = self.scope['user'].username
		if data['player1']['username'] == curr_username:
			ic(f'Current user: {curr_username} Opponent: {data['player2']['username']}')
			self.send(text_data=json.dumps({'opponent': data['player2']}))
		else:
			ic(f'Current user: {curr_username} Opponent: {data['player1']['username']}')
			self.send(text_data=json.dumps({'opponent': data['player1']}))

		#! WAS looking it what the players were receiving.
			


# if the queue is empty: (no room available)
#	- create a new channel_name and add it to the object
# 	- push the new object alongside the channel name to the queue
# else: (available rooms)
# 	- Pop the first available room in the queue
#	- Add the client to the room
# 	- Broadcast a message to the channel with the IPs of both
				