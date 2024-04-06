import os
import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer


class NuevaSala(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["sala_id"]
        self.room_group_name = f"sala_{self.room_name}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        self.__set_channels_count()

    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        self.__unset_channels_count()

    async def receive_json(self, request):
        await self.channel_layer.group_send(
            self.room_group_name, {'type': request['operacion'], 'content': request}
        )


    #Iniciar contador de channels ===================================
    def __set_channels_count(self):
        file = 'game_cache.txt'
        self.channels_count = None

        if os.path.exists(file):
            self.channels_count = int(open(file, 'r').read()) + 1
        else:
            self.channels_count = 1

        open(file, 'w').write(str(self.channels_count))



    #Borrar contador de channels ===================================
    def __unset_channels_count(self):
        file = 'game_cache.txt'
        self.channels_count = None

        if os.path.exists(file):
            os.remove(file)




    #Asignar una marca X o 0 para el jugador ========================
    async def establecer_marca(self, request):
        d = request['content']
        
        if(self.channels_count == 1): self.playerMark = 'X'
        else: self.playerMark = 'O'
        
        await self.send_json({
            'operacion': d['operacion'],
            'marca': self.playerMark,
        })


    
    async def player_update(self, request):
        await self.send_json(request['content'])

    async def oper_end(self, request):
        await self.send_json(request['content'])

    async def chat_message(self, request):
        await self.send_json(request['content'])



    