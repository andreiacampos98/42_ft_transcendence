from django.db import models
from django.core.exceptions import ValidationError


class NotificationType(models.TextChoices):
    FRIEND_REQUEST = "Friend Request"
    ACCEPTED_FRIEND_REQUEST = "Accepted Friend Request"

class NotificationStatus(models.TextChoices):
    PENDING = "Pending"
    READ = "Read"

class TournamentStatus(models.TextChoices):
    OPEN = "Open"
    ONGOING = "Ongoing"
    FINISHED = "Finished"

class TournamentPhase(models.TextChoices):
    LAST16 = "Last 16"
    QUARTERFINAL = "Quarter-final"
    SEMIFINAL = "Semi-final"
    FINAL = "Final"

class UserStatus(models.TextChoices):
    OFFLINE = "Offline"
    ONLINE = "Online"
    PLAYING = "Playing"

class Users(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=64)
    password = models.CharField(max_length=255)
    description = models.TextField()
    email = models.EmailField()
    picture = models.ImageField(default='default.jpg', upload_to='upload')
    status = models.CharField(default=UserStatus.OFFLINE)
    # created_at = models.DateTimeField(auto_now_add=True)
    # update_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.status not in ['Offline', 'Online', 'Playing']:
            raise ValidationError('Status must be one of Offline, Online or Playing')
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
    update_at = models.DateTimeField(auto_now=True)

class Notifications(models.Model):
    id = models.AutoField(primary_key=True)
    type = models.CharField(choices=NotificationType.choices)
    status = models.CharField(choices=NotificationStatus.choices, default=NotificationStatus.PENDING)
    description = models.CharField(max_length=255)
    user_id = models.ForeignKey(Users, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

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
    status = models.CharField(choices=TournamentStatus.choices, default=TournamentStatus.OPEN)
    winner_id = models.ForeignKey(Users, related_name="tournament_winner", null=True, on_delete=models.SET_NULL)
    host_id = models.ForeignKey(Users, related_name="tournament_host", null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)

class TournamentsGames(models.Model):
    id = models.AutoField(primary_key=True)
    phase = models.CharField(choices=TournamentPhase.choices)
    tournament_id = models.ForeignKey(Tournaments, on_delete=models.CASCADE)
    game_id = models.ForeignKey(Games, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


