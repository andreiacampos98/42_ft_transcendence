from django.core.management.base import BaseCommand
from pong.models import Users, UserStats

class Command(BaseCommand):
    help = 'Cria um usuário AI automaticamente'

    def handle(self, *args, **kwargs):
        username = "aiuser2024"
        password = "Aiuser@2024"

        # Verifica se o usuário já existe
        user = Users.objects.filter(username=username).first()
        if not user:
            # Cria o usuário
            user = Users.objects.create_user(username=username, password=password)
            user.picture='matrix.jpg'
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Usuário "{username}" criado com sucesso.'))


            # Cria estatísticas associadas
            UserStats.objects.create(user_id=user)
            self.stdout.write(self.style.SUCCESS(f'Estatísticas para o usuário "{username}" criadas com sucesso.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'O usuário "{username}" já existe.'))
