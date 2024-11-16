"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

# import os
# from chat.routing import ws_urlpatternsication(),
#         "websocket": AuthMiddlewareStack(
#             # PresenceConsumer.as_asgi()
#             URLRouter(pong.urls.websocket_urlpatterns)
#         ),
#     }
# )

import os, django
from django.core.asgi import get_asgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
django_asgi_app = get_asgi_application()

import pong.urls
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter


application = ProtocolTypeRouter({
  'https': django_asgi_app,
  'websocket': AuthMiddlewareStack(URLRouter(pong.urls.websocket_urlpatterns))
})