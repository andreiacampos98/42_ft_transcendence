from django.core.management.base import BaseCommand
from pong.models import Users, UserStats

class Command(BaseCommand):
	help = 'Cria um usuário AI automaticamente'

	def handle(self, *args, **kwargs):
		username = "AI BOT"
		password = "Aiuser@2024"

		user = Users.objects.filter(username=username).first()
		if not user:
			user = Users.objects.create_user(username=username, password=password)
			user.picture = 'matrix.jpg'
			user.status = 'Online'
			user.save()

			UserStats.objects.create(user_id=user)
