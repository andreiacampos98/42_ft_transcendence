from django.db import models
from django.core.exceptions import ValidationError


class Users(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=64)
    password = models.CharField(max_length=255)
    description = models.TextField(null=True)
    email = models.EmailField(null=True)
    picture = models.ImageField(default='default.jpg', upload_to='upload')
    status = models.CharField(default='Offline')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.status not in ['Offline', 'Online', 'Playing']:
            raise ValidationError('Status must be one of "[\'Offline\', \'Online\'], \'Playing\']"')
        super().save(*args, **kwargs)

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