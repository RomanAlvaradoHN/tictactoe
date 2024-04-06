from django.urls import path, re_path

from . import consumers

websocket_urlpatterns = [
    path("ws/tictactoe/<sala_id>/", consumers.NuevaSala.as_asgi()),
]