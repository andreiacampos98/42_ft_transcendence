# Generated by Django 5.1.3 on 2024-11-30 17:48

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Users',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('id', models.AutoField(primary_key=True, serialize=False, unique=True)),
                ('user_42', models.IntegerField(null=True)),
                ('username', models.CharField(max_length=64, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('email', models.EmailField(blank=True, max_length=254, null=True)),
                ('picture', models.ImageField(default='default.jpg', null=True, upload_to='upload')),
                ('status', models.CharField(default='Offline', max_length=7)),
                ('two_factor', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_superuser', models.BooleanField(default=False)),
                ('last_login', models.DateTimeField(blank=True, null=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Games',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('type', models.CharField(max_length=20)),
                ('start_date', models.DateTimeField()),
                ('duration', models.IntegerField(default=0)),
                ('nb_goals_user1', models.IntegerField(default=0)),
                ('nb_goals_user2', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user1_id', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='game_user1', to=settings.AUTH_USER_MODEL)),
                ('user2_id', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='game_user2', to=settings.AUTH_USER_MODEL)),
                ('winner_id', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='game_winner', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='GamesStats',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('longer_rally', models.IntegerField(default=0)),
                ('shorter_rally', models.IntegerField(default=0)),
                ('average_rally', models.IntegerField(default=0)),
                ('max_ball_speed', models.FloatField(default=0)),
                ('min_ball_speed', models.FloatField(default=0)),
                ('average_ball_speed', models.FloatField(default=0)),
                ('greatest_deficit_overcome', models.IntegerField(default=0)),
                ('most_consecutive_goals', models.IntegerField(default=0)),
                ('biggest_lead', models.IntegerField(default=0)),
                ('bg_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='bg_games', to=settings.AUTH_USER_MODEL)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pong.games')),
                ('gdo_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='gdo_games', to=settings.AUTH_USER_MODEL)),
                ('mcg_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='mcg_games', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Goals',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('timestamp', models.DateTimeField(null=True)),
                ('rally_length', models.IntegerField(default=0)),
                ('ball_speed', models.FloatField(default=0)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pong.games')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='user_goals', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Notifications',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('type', models.CharField()),
                ('status', models.CharField(default='Pending')),
                ('description', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('other_user_id', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='other', to=settings.AUTH_USER_MODEL)),
                ('user_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='me', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Tournaments',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=64)),
                ('capacity', models.IntegerField()),
                ('status', models.CharField(default='Open')),
                ('duration', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('host_id', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tournament_host', to=settings.AUTH_USER_MODEL)),
                ('winner_id', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tournament_winner', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='TournamentsGames',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('phase', models.CharField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('game_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pong.games')),
                ('tournament_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pong.tournaments')),
            ],
        ),
        migrations.CreateModel(
            name='UserStats',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('nb_tournaments_played', models.IntegerField(default=0)),
                ('nb_tournaments_won', models.IntegerField(default=0)),
                ('nb_games_played', models.IntegerField(default=0)),
                ('nb_games_won', models.IntegerField(default=0)),
                ('nb_goals_scored', models.IntegerField(default=0)),
                ('nb_goals_suffered', models.IntegerField(default=0)),
                ('max_ball_speed', models.FloatField(default=0)),
                ('date_max_ball_speed', models.DateTimeField(null=True)),
                ('max_rally_length', models.IntegerField(default=0)),
                ('date_max_rally_length', models.DateTimeField(null=True)),
                ('quickest_game', models.IntegerField(default=2147483647)),
                ('date_quickest_game', models.DateTimeField(null=True)),
                ('longest_game', models.IntegerField(default=0)),
                ('date_longest_game', models.DateTimeField(null=True)),
                ('num_first_goals', models.IntegerField(default=0)),
                ('remote_time_played', models.IntegerField(default=0)),
                ('local_time_played', models.IntegerField(default=0)),
                ('ai_time_played', models.IntegerField(default=0)),
                ('tournament_time_played', models.IntegerField(default=0)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Friends',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('accepted', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user1_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friends_with', to=settings.AUTH_USER_MODEL)),
                ('user2_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friends_of', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user1_id', 'user2_id')},
            },
        ),
        migrations.CreateModel(
            name='TournamentsUsers',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('alias', models.CharField(max_length=64)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('placement', models.IntegerField(default=0)),
                ('score', models.IntegerField(default=0)),
                ('tournament_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pong.tournaments')),
                ('user_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user_id', 'tournament_id')},
            },
        ),
    ]
