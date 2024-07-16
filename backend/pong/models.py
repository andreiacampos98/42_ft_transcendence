from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin



#make_password Creates a hashed password in the format used by this application.

class UserManager(BaseUserManager):
    def create_user(self, username, password1, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        if not password1:
            raise ValueError('The Password field must be set')
        user = self.model(username=username, **extra_fields)
        user.set_password(password1)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, password, **extra_fields)

class Users(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True, unique=True)
    username = models.CharField(max_length=64, unique=True)
    password = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    picture = models.ImageField(default='default.jpg', upload_to='upload')
    status = models.CharField(max_length=7, default='Offline')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    @property
    def is_authenticated(self):
        return True  # Implemente a lógica de autenticação conforme necessário

    def is_active(self):
        return True  # Implemente conforme necessário

    def has_perm(self, perm, obj=None):
        return True  # Implemente conforme necessário

    def has_module_perms(self, app_label):
        return True  # Implemente conforme necessário


class Friends(models.Model):
    user1_id = models.ForeignKey(Users, related_name="friends_with", on_delete=models.CASCADE)
    user2_id = models.ForeignKey(Users, related_name="friends_of", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user1_id", "user2_id"]

class UserStats(models.Model):
    id = models.AutoField(primary_key=True)
    nb_games_played = models.IntegerField()
    nb_games_won = models.IntegerField()
    nb_goals_scored = models.IntegerField()
    nb_goals_suffered = models.IntegerField()
    user_id = models.ForeignKey(Users, on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

class Notifications(models.Model):
    id = models.AutoField(primary_key=True)
    type = models.CharField()
    status = models.CharField(default='Pending')
    description = models.CharField(max_length=255)
    user_id = models.ForeignKey(Users, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.status not in ['Read', 'Pending']:
            raise ValidationError('Status must be one of "[\'Read\', \'Pending\']"')
        if self.type not in ['Friend Request', 'Accepted Friend Request']:
            raise ValidationError('Status must be one of "[\'Friend Request\', \'Accepted Friend Request\']"')

        super().save(*args, **kwargs)

class Games(models.Model):
    id = models.AutoField(primary_key=True)
    start_date = models.DateTimeField()
    duration = models.IntegerField()
    nb_goals_user1 = models.IntegerField()
    nb_goals_user2 = models.IntegerField()
    winner_id = models.ForeignKey(Users, related_name="game_winner", null=True, on_delete=models.SET_NULL)
    user1_id = models.ForeignKey(Users, related_name="game_user1", null=True, on_delete=models.SET_NULL)
    user2_id = models.ForeignKey(Users, related_name="game_user2", null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

class Tournaments(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=64)
    capacity = models.IntegerField()
    status = models.CharField(default='Open')
    winner_id = models.ForeignKey(Users, related_name="tournament_winner", null=True, on_delete=models.SET_NULL)
    host_id = models.ForeignKey(Users, related_name="tournament_host", null=True, on_delete=models.SET_NULL)
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