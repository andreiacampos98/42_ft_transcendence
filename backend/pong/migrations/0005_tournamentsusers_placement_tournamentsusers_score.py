# Generated by Django 5.1 on 2024-08-23 18:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0004_alter_tournamentsusers_alias'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournamentsusers',
            name='placement',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='tournamentsusers',
            name='score',
            field=models.IntegerField(default=0),
        ),
    ]