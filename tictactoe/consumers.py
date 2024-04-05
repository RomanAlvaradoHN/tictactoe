import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer


class NuevaSala(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["sala_info"]
        self.room_group_name = f"sala_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    
    
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    
    
    
    # Receive message from WebSocket
    async def receive_json(self, content):
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "data": content['data']}
        )

    
    
    
    # Receive message from room group
    async def chat_message(self, event):
        await self.send_json({"message": event['data']})