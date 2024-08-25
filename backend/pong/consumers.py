import json
from .models import TournamentsUsers
from .serializers import TournamentsUsersSerializer
from icecream import ic

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class TournamentConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = f'{self.scope["url_route"]["kwargs"]["tournament_id"]}'
        self.user = self.scope["user"]

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
        data = json.loads(text_data)
        ic(data)
        tournament_id = data['tournament_id']
        all_tour_users = TournamentsUsers.objects.filter(tournament_id=tournament_id)
        serializer = TournamentsUsersSerializer(all_tour_users, many=True)

        ic(serializer.data)

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "tournament.join", "message": json.dumps(serializer.data)}
        )

    def tournament_join(self, event):
        self.send(text_data=event["message"])

