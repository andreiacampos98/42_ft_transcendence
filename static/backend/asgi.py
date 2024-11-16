"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter # <- Add this
from channels.auth import AuthMiddlewareStack # <- Add this
from pong.consumers import TournamentConsumer # <- Add this

import pong.urls



os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(
            # PresenceConsumer.as_asgi()
            URLRouter(pong.urls.websocket_urlpatterns)
        ),
    }
)

