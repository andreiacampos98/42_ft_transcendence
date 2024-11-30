from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Cria um superusuário AI automaticamente'

    def handle(self, *args, **kwargs):
        username = "aiuser2024"
        password = "Aiuser@2024"

        User = get_user_model()

        # Verifica se o usuário já existe
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(username=username, password=password)
            self.stdout.write(self.style.SUCCESS(f'Superusuário {username} criado com sucesso.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'O usuário {username} já existe.'))
