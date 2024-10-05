from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin



#make_password Creates a hashed password in the format used by this application.

class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        if not password:
            raise ValueError('The Password field must be set')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, password, **extra_fields)

class Users(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True, unique=True)
    user_42 = models.IntegerField(null=True)
    username = models.CharField(max_length=64, unique=True)
    description = models.TextField(null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    picture = models.ImageField(default='default.jpg', upload_to='upload', null=True)
    status = models.CharField(max_length=7, default='Offline')
    two_factor = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.username

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

class Friends(models.Model):
    user1_id = models.ForeignKey(Users, related_name="friends_with", on_delete=models.CASCADE)
    user2_id = models.ForeignKey(Users, related_name="friends_of", on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user1_id", "user2_id"]

class Notifications(models.Model):
    id = models.AutoField(primary_key=True)
    type = models.CharField()
    status = models.CharField(default='Pending')
    description = models.CharField(max_length=255)
    user_id = models.ForeignKey(Users, related_name="me", on_delete=models.CASCADE)
    other_user_id = models.ForeignKey(Users, related_name="other", on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.status not in ['Read', 'Pending']:
            raise ValidationError('Status must be one of "[\'Read\', \'Pending\']"')
        if self.type not in ['Friend Request', 'Accepted Friend Request']:
            raise ValidationError('Status must be one of "[\'Friend Request\', \'Accepted Friend Request\']"')

        super().save(*args, **kwargs)

class Games(models.Model):
    id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=20)
    start_date = models.DateTimeField()
    duration = models.IntegerField(default=0)
    nb_goals_user1 = models.IntegerField(default=0)
    nb_goals_user2 = models.IntegerField(default=0)
    winner_id = models.ForeignKey(Users, related_name="game_winner", null=True, on_delete=models.SET_NULL)
    user1_id = models.ForeignKey(Users, related_name="game_user1", null=True, on_delete=models.SET_NULL)
    user2_id = models.ForeignKey(Users, related_name="game_user2", null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.type not in ['Remote', 'Local', 'AI', 'Tournament']:
            raise ValidationError('Type of the game must be one of "[\'Remote\', \'Local\', \'Local\', \'Tournament\']"')
        super().save(*args, **kwargs)

class Tournaments(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=64)
    capacity = models.IntegerField()
    status = models.CharField(default='Open')
    winner_id = models.ForeignKey(Users, related_name="tournament_winner", null=True, on_delete=models.SET_NULL)
    host_id = models.ForeignKey(Users, related_name="tournament_host", null=True, on_delete=models.SET_NULL)
    duration = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.status not in ['Open', 'Ongoing', 'Finished']:
            raise ValidationError('Status must be one of "[\'Open\', \'Ongoing\'], \'Finished\']"')
        super().save(*args, **kwargs)

class TournamentsGames(models.Model):
    id = models.AutoField(primary_key=True)
    phase = models.CharField()
    tournament_id = models.ForeignKey(Tournaments, on_delete=models.CASCADE)
    game_id = models.ForeignKey(Games, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.phase not in ['Last 16', 'Quarter-final', 'Semi-final', 'Final']:
            raise ValidationError('Status must be one of "[\'Last 16\', \'Quarter-final\'], \'Semi-final\'], \'Final\']"')

        super().save(*args, **kwargs)

class TournamentsUsers(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(Users, on_delete=models.CASCADE)
    tournament_id = models.ForeignKey(Tournaments, on_delete=models.CASCADE)
    alias = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    placement = models.IntegerField(default=0)
    score = models.IntegerField(default=0)

    class Meta:
        unique_together = ["user_id", "tournament_id"]


class UserStats(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(Users, on_delete=models.CASCADE)
    nb_tournaments_played = models.IntegerField(default=0)
    nb_tournaments_won = models.IntegerField(default=0)
    nb_games_played = models.IntegerField(default=0)
    nb_games_won = models.IntegerField(default=0)
    nb_goals_scored = models.IntegerField(default=0)
    nb_goals_suffered = models.IntegerField(default=0)
    max_ball_speed = models.IntegerField(default=0)
    max_rally_length = models.IntegerField(default=0)
    quickest_game = models.IntegerField(default=2147483647)
    longest_game = models.IntegerField(default=0)
    num_first_goals = models.IntegerField(default=0)
    remote_time_played = models.IntegerField(default=0)
    local_time_played =models.IntegerField(default=0)
    ai_time_played = models.IntegerField(default=0)
    tournament_time_played = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)


class Goals(models.Model):
    id = models.AutoField(primary_key=True)
    timestamp = models.DateTimeField(null=True)     
    user = models.ForeignKey(Users, on_delete=models.SET_NULL, null=True, related_name='user_goals')
    game =  models.ForeignKey(Games, on_delete=models.CASCADE)
    rally_length = models.IntegerField(default=0)
    ball_speed = models.FloatField(default=0)

class GamesStats(models.Model):
    id = models.AutoField(primary_key=True)
    game =  models.ForeignKey(Games, on_delete=models.CASCADE)  
    longer_rally = models.IntegerField(default=0)
    shorter_rally = models.IntegerField(default=0)
    average_rally = models.IntegerField(default=0)
    max_ball_speed = models.IntegerField(default=0)
    min_ball_speed = models.IntegerField(default=0)
    average_ball_speed = models.IntegerField(default=0)
    greatest_deficit_overcome = models.IntegerField(default=0)
    gdo_user = models.ForeignKey(Users, on_delete=models.SET_NULL, null=True, related_name='gdo_games')
    most_consecutive_goals = models.IntegerField(default=0)
    mcg_user = models.ForeignKey(Users, on_delete=models.SET_NULL, null=True, related_name='mcg_games')
    biggest_lead = models.IntegerField(default=0)
    bg_user = models.ForeignKey(Users, on_delete=models.SET_NULL, null=True, related_name='bg_games')

