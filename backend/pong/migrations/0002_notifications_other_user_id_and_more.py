# Generated by Django 5.0.7 on 2024-07-31 18:54

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='notifications',
            name='other_user_id',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='other', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='notifications',
            name='user_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='me', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='users',
            name='picture',
            field=models.ImageField(default='default.jpg', null=True, upload_to='upload'),
        ),
    ]