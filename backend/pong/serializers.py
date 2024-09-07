from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import *

# Serializers define the API representation.
# Django Rest Framework uses serializers to handle converting data between 
# JSON or XML and native Python objects. 
# There are a number of helpful serializers we can import that will make serializing
#  our objects easier. 
# The most common one we use is a ModelSerializer, 
# which conveniently can be used to serialize data for Company objects:


class UsersSerializer(serializers.ModelSerializer):

	class Meta:
		model = Users
		fields = ['id', 'username', 'password', 'description', 'email', 'picture', 'status', 'created_at', 'updated_at']
		extra_kwargs = {
			'password': {'write_only': True, 'required': False},
			'username': {'required': False},
			'description': {'required': False},
			'email': {'required': False},
			'picture': {'required': False},
			'status': {'required': False},
		}

	def create(self, validated_data):
		user = Users.objects.create_user(**validated_data)
		return user

	def update(self, instance, validated_data):
		instance.username = validated_data.get('username', instance.username)
		instance.email = validated_data.get('email', instance.email)
		instance.description = validated_data.get('description', instance.description)
		instance.picture = validated_data.get('picture', instance.picture)
		instance.status = validated_data.get('status', instance.status)
		if 'password' in validated_data:
			instance.password = make_password(validated_data['password'])
		instance.save()
		return instance

class FriendsSerializer(serializers.ModelSerializer):
	user1_id = UsersSerializer(read_only=True)
	user2_id = UsersSerializer(read_only=True)

	class Meta:
		model = Friends
		fields = ['user1_id', 'user2_id', 'accepted', 'created_at']

class UserStatsSerializer(serializers.ModelSerializer):
	class Meta:
		model = UserStats
		fields = '__all__'

class NotificationsSerializer(serializers.ModelSerializer):
	user_id = UsersSerializer(read_only=True)
	other_user_id = UsersSerializer(read_only=True)

	class Meta:
		model = Notifications
		fields = ['id', 'type', 'status', 'description', 'user_id', 'other_user_id', 'created_at']

class GamesSerializer(serializers.ModelSerializer):
	class Meta:
		model = Games
		fields = '__all__'

class TournamentsSerializer(serializers.ModelSerializer):
	class Meta:
		model = Tournaments
		fields = '__all__'

class TournamentsUsersSerializer(serializers.ModelSerializer):
	class Meta:
		model = TournamentsUsers
		fields = '__all__'

class TournamentsGamesSerializer(serializers.ModelSerializer):
	class Meta:
		model = TournamentsGames
		fields = '__all__'



