import json
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
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "tournament.join", "message": text_data}
        )

    def tournament_join(self, event):
        self.send(text_data=event["message"])

