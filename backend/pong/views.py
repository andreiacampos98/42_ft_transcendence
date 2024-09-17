from django.shortcuts import render, redirect, get_object_or_404
from django.conf import settings
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.parsers import JSONParser 
from django.urls import reverse

from django.contrib.auth.hashers import make_password 
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.middleware.csrf import get_token
from datetime import datetime
from urllib.parse import quote
import os

import json, requests, os
from icecream import ic
from .models import Users
import pprint  
from datetime import datetime
# Since we want to create an API endpoint for reading, creating, and updating 
# Company objects, we can use Django Rest Framework mixins for such actions.
from rest_framework import status

from django.db.models import Q
from django.http import JsonResponse, HttpResponseRedirect
from .models import Users, Friends, Notifications, TournamentsUsers
from .serializers import *

phase_shifts = dict(zip(
	['Last 16', 'Quarter-final', 'Semi-final'], 
	['Quarter-final', 'Semi-final', 'Final']
))

first_tour_phase = dict(zip(
	[16, 8, 4], 
	['Last 16', 'Quarter-final', 'Semi-final']
))

total_phase_matches = dict(zip(
	['Last 16', 'Quarter-final', 'Semi-final', 'Final'], 
	[8, 4, 2, 1]
))



#! --------------------------------------- Users ---------------------------------------

@login_required
def profile(request, username):
	user_id = request.user.id
	user_profile = get_object_or_404(Users, username=username)
	is_own_profile = user_profile == request.user

	friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
	friendship = Friends.objects.filter(
		(Q(user1_id=user_id, user2_id=user_profile.id) | Q(user1_id=user_profile.id, user2_id=user_id))
	).first()

	notification = Notifications.objects.filter(Q(type='Friend Request') & Q(user_id=user_id, other_user_id=user_profile.id)).first()
	me = False

	if friendship:
		is_friend = True
		friendship_status = friendship.accepted
		if friendship.user1_id.id == user_id:
			me = True
	else:
		is_friend = False
		friendship_status = None

	user = get_object_or_404(Users, username=username)
	games = Games.objects.filter(Q(Q(user1_id=user_profile.id) | Q(user2_id=user_profile.id)) & Q(tournament=False)).order_by('-created_at')
	tournament_response = tournament_list_user(request, user_profile.id)
	user_tournaments = json.loads(tournament_response.content)
	stats_response = user_stats(request, user_profile.id)
	stats = json.loads(stats_response.content)
	context = {
		'friends': friends,
		'user_id': user_id,
		'user_view': user,
		'joined_date':user.created_at.strftime('%d/%m/%Y'),
		'is_own_profile': is_own_profile,
		'is_friend': is_friend,
		'friendship_status': friendship_status,
		'me': me,
		'notification': notification,
		'games': games,
		'tours': user_tournaments,
		'stats': stats,
		'page': 'profile' if is_own_profile else 'else'
	}
	ic(context)
	return render(request, 'pages/view_profile.html', context)

def user_detail(request, pk):
	if request.method == 'GET':
		user = get_object_or_404(Users, pk=pk)
		serializer = UsersSerializer(user)
		return JsonResponse(serializer.data, safe=False)
	else:
		return JsonResponse({'message': 'Invalid request method.', 'method': request.method}, status=405)


@csrf_exempt
def user_create(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body) 
			username = data.get('username')
			password1 = data.get('password')
			password2 = data.get('reconfirm')
			ic([username, password1, password2])
		except json.JSONDecodeError:
			return JsonResponse({'message': 'Invalid JSON.', 'data': {}}, status=400)

		if not username or not password1 or not password2:
			return JsonResponse({'message': 'All fields are required.', 'data': {}}, status=400)

		if Users.objects.filter(username=username).exists():
			return JsonResponse({'message': 'Username already exists! Please try another username.', 'data': {}}, status=400)

		if password1 != password2:
			return JsonResponse({'message': 'Passwords didn\'t match.', 'data': {}}, status=400)

		if not username.isalnum():
			return JsonResponse({'message': 'Username must be alphanumeric.', 'data': {}}, status=400)

		myuser = Users.objects.create_user(username=username, password=password1)
		myuser.save()

		UserStats.objects.create(
            user_id=myuser
        )

		user = authenticate(username=username, password=password1)

		if user is not None:
			myuser.status="Online"
			myuser.save()
			login(request, user)
			return JsonResponse({'message': 'Your account has been successfully created and you are now logged in.'}, status=201)

		
	return JsonResponse({'message': 'Invalid request method.', 'method': request.method}, status=405)


@csrf_exempt
def user_update(request, pk):
	user = get_object_or_404(Users, pk=pk)

	if request.method == 'POST':
		data = request.POST.copy()

		email = data.get('email', None)
		if email:
			try:
				validate_email(email)
			except ValidationError:
				return JsonResponse({'message': 'Invalid email format.', 'data': {}}, status=400)

		if 'picture' not in request.FILES:
			data['picture'] = user.picture
		
		data.update(request.FILES)
	

		serializer = UsersSerializer(user, data=data, partial=True)

		if serializer.is_valid():
			serializer.save()
			return redirect('user-profile', user.username)
		return JsonResponse(serializer.errors, status=400)
	else:
		return JsonResponse({'message': 'Invalid request method.', 'method': request.method, 'data': {}}, status=405)

@csrf_exempt
def user_password(request, pk):
	if request.method == 'POST':
		user = get_object_or_404(Users, pk=pk)
		old_password = request.POST.get('old_password')
		new_password1 = request.POST.get('password1')
		new_password2 = request.POST.get('password2')

		if not user.check_password(old_password):
			return JsonResponse({'message': 'Old password is incorrect.', 'data': {}}, status=400)

		if not new_password1:
			return JsonResponse({'message': 'New password is required.', 'data': {}}, status=400)

		if user.check_password(new_password1):
			return JsonResponse({'message': 'New password cannot be the same as the old password.', 'data': {}}, status=400)
		
		if new_password1 != new_password2:
			return JsonResponse({'message': 'Passwords did not match.', 'data': {}}, status=400)

		user.set_password(new_password1)
		user.save()

		update_session_auth_hash(request, user)
		return JsonResponse({'message': 'Password updated successfully', 'redirect_url': reverse('user-profile', args=[user.username])}, status=200)
	else:
		return JsonResponse({'message': 'Invalid request method.', 'method': request.method, 'data': {}}, status=405)

@csrf_exempt
def search_suggestions(request):
	term = request.GET.get('term', '')
	if term:
		users = Users.objects.filter(username__icontains=term)[:5]
		suggestions = [{'username': user.username} for user in users]
		return JsonResponse(suggestions, safe=False)
	return JsonResponse([], safe=False)


@csrf_exempt
def search_users(request):
	term = request.GET.get('searched', '')
	userss = Users.objects.filter(username__icontains=term)
	return render(request, 'pages/search_users.html', {
		'searched': term,
		'userss': userss,
		'numbers': userss.count(),
	})

#! --------------------------------------- Friends ---------------------------------------

def get_user_friends(request, user_id):
	if request.method == 'GET':
		friends = Friends.objects.filter(
			(Q(user1_id=user_id) | Q(user2_id=user_id)) & Q(accepted=True)
		)
		serializer = FriendsSerializer(friends, many=True)
	return JsonResponse(serializer.data, safe=False)

@csrf_exempt
def add_remove_friend(request, user1_id, user2_id):
	if request.method == 'POST':
		if user1_id == user2_id:
			return JsonResponse({'message': 'Users cannot be friends with themselves.', 'data': {}}, status=400)
		
		if Friends.objects.filter(user1_id=user1_id, user2_id=user2_id).exists() or \
		Friends.objects.filter(user1_id=user2_id, user2_id=user1_id).exists():
			return JsonResponse({'message': 'Friendship already exists.', 'data': {}}, status=400)

		user1 = get_object_or_404(Users, id=user1_id)
		user2 = get_object_or_404(Users, id=user2_id)

		friend = Friends.objects.create(user1_id=user1, user2_id=user2, accepted=False)
		notification = Notifications.objects.create(type='Friend Request', status='Pending', description=' has request to be your friend.', user_id = user2, other_user_id = user1)
		notification.save()
		response_data = {
			'message': 'Friendship request sent successfully.',
			'user1': user1.username,
			'user2': user2.username,
			'accepted': friend.accepted
		}
		return JsonResponse(response_data, status=201)

	elif request.method == 'DELETE':
		friendship = Friends.objects.filter(
			(Q(user1_id=user1_id, user2_id=user2_id) | Q(user1_id=user2_id, user2_id=user1_id))
		).first()

		if not friendship:
			return JsonResponse({'message': 'Friendship does not exist.', 'data': {}}, status=404)

		friendship.delete()

		response_data = {
			'message': 'Friendship deleted successfully.'
		}
		return JsonResponse(response_data, status=200)
	return JsonResponse({'message': 'Invalid request method.', 'method': request.method, 'data': {}}, status=405)

@csrf_exempt
def accept_friend(request, user1_id, user2_id):
	if request.method == 'PATCH':
		friendship = Friends.objects.filter(
			(Q(user1_id=user1_id, user2_id=user2_id) | Q(user1_id=user2_id, user2_id=user1_id))
		).first()

		if not friendship:
			return JsonResponse({'message': 'Friendship does not exist.', 'data': {}}, status=404)
		
		if friendship.accepted:
			return JsonResponse({'message': 'Friendship request has already been accepted.', 'data': {}}, status=400)
		
		friendship.accepted = True
		friendship.save()
		user1 = get_object_or_404(Users, id=user1_id)
		user2 = get_object_or_404(Users, id=user2_id)
		notification = Notifications.objects.create(type='Accepted Friend Request', status='Pending', description=' has accepted your friend request!', user_id = user2, other_user_id = user1)
		notification.save()
		response_data = {
			'message': 'User accept the request.'
		}
		return JsonResponse(response_data, status=200)
	return JsonResponse({'message': 'Invalid request method.', 'method': request.method, 'data': {}}, status=405)

#! --------------------------- Notifications ----------------------------------

def get_user_notifications(request, user_id):
	if request.method == 'GET':
		notifications = Notifications.objects.filter(user_id = user_id)
		serializer = NotificationsSerializer(notifications, many=True)
		return JsonResponse(serializer.data, safe=False)
	return JsonResponse({'message': 'Invalid request method.', 'method': request.method, 'data': {}}, status=405)

@csrf_exempt
def delete_user_notification(request, user_id, notif_id):
	if request.method == 'DELETE':
		notifications = Notifications.objects.filter(Q(user_id = user_id) & Q( id = notif_id))
		notifications.delete()
		response_data = {
			'message': 'Notification deleted.'
		}
		return JsonResponse(response_data, status=204)
	return JsonResponse({'message': 'Invalid request method.', 'method': request.method, 'data': {}}, status=405)

@csrf_exempt
def update_notification(request, notif_id):
	if request.method == 'PATCH':
		notifications = Notifications.objects.get(id = notif_id)
		notifications.status = 'Read'
		notifications.save()
		response_data = {
			'message': 'Status of notification updated.'
		}
		return JsonResponse(response_data, status=204)
	return JsonResponse({'message': 'Invalid request method.', 'method': request.method, 'data': {}}, status=405)

#! --------------------------------------- Stats ---------------------------------------

def user_stats(request, user_id):
	if request.method == 'GET':
		try:
			stats = UserStats.objects.get(user_id=user_id)
			serializer = UserStatsSerializer(stats)
			data = serializer.data
			data['losses']= stats.nb_games_played - stats.nb_games_won
			if stats.nb_games_played > 0:
				data['win_rate'] = (stats.nb_games_won/stats.nb_games_played) * 100
			else:
				data['win_rate'] = 0
			return JsonResponse(data, status=200)
		except UserStats.DoesNotExist:
			return JsonResponse({'message': 'UserStats not found.'}, status=404)
	return JsonResponse({'message': 'Method not allowed'}, status=405)

def leaderboard(request):
    if request.method == 'GET':
        top_users = UserStats.objects.all().order_by('-nb_tournaments_won')[:3]

        enriched_top_users = []
        for top_user in top_users:
            user = Users.objects.get(pk=top_user.user_id.id)  # Acessa o campo 'id' do objeto user_id

            user_stats_serializer = UserStatsSerializer(top_user)
            user_serializer = UsersSerializer(user)

            enriched_data = user_stats_serializer.data
            enriched_data['user'] = user_serializer.data

            enriched_top_users.append(enriched_data)

        return JsonResponse(enriched_top_users, safe=False, status=200)

    return JsonResponse({'message': 'Method not allowed'}, status=405)


def current_place(request, user_id):
	top_users = UserStats.objects.all().order_by('-nb_tournaments_won')
	position = 1 
	for user_stats in top_users:
		if user_stats.user_id.id == user_id:
			return position
		position += 1
	return None

#! --------------------------------------- Games ---------------------------------------

@csrf_exempt
def game_create(request):
	try:
		data = json.loads(request.body.decode('utf-8'))
		serializer = GamesSerializer(data=data)
		data['start_date'] = datetime.now().isoformat()
		if serializer.is_valid():
			serializer.save()
			user1_id = data.get('user1_id')
			user2_id = data.get('user2_id')

			if user1_id:
				user1 = Users.objects.get(id=user1_id)
				user1.status = "Playing"
				user1.save()

			if user2_id:
				user2 = Users.objects.get(id=user2_id)
				user2.status = "Playing"
				user2.save()

			return JsonResponse(serializer.data, status=201)
		return JsonResponse(serializer.errors, status=400)
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON', 'data': {}}, status=400)
	except KeyError as e:
		return JsonResponse({'message': f'Missing key: {str(e)}', 'data': {}}, status=400)
	
@csrf_exempt
def game_update(request, game_id):
	if request.method != 'POST':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method, 'data': {}}, status=405)
	if request.content_type != 'application/json':
		return JsonResponse({'message': 'Only JSON allowed', 'data': {}}, status=406)

	data = {}

	try:
		data = json.loads(request.body.decode('utf-8'))
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON', 'data': {}}, status=400)
	except KeyError as e:
		return JsonResponse({'message': f'Missing key: {str(e)}', 'data': {}}, status=400)

	game = Games.objects.get(pk=game_id)
	game.duration = data['duration']
	game.nb_goals_user1 = data['nb_goals_user1']
	game.nb_goals_user2 = data['nb_goals_user2']

	player1 = Users.objects.get(pk=game.user1_id.id)
	player2 = Users.objects.get(pk=game.user2_id.id)


	if data['nb_goals_user1'] > data['nb_goals_user2']:
		game.winner_id = player1
	else:
		game.winner_id = player2
	game.save()
	player1.status = "Online"
	player1.save()
	player2.status = "Online"
	player2.save()

	
	data = GamesSerializer(game).data
	return JsonResponse(data, status=200)


#! --------------------------------------- Tournaments ---------------------------------------

@csrf_exempt
def tournament_create(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method, 'data': {}})

	try:
		data = json.loads(request.body.decode('utf-8'))
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON', 'data': {}}, status=400)
	except KeyError as e:
		return JsonResponse({'message': f'Missing key: {str(e)}', 'data': {}}, status=400)
	
	tour_serializer = TournamentsSerializer(data=data)
	if not tour_serializer.is_valid():
		return JsonResponse(tour_serializer.errors, status=400)

	tournament = tour_serializer.save()
	user_data = {
		'alias': data['alias'],
		'user_id': data['host_id'],
		'tournament_id': tournament.id
	}

	tour_user_serializer = TournamentsUsersSerializer(data=user_data)
	if not tour_user_serializer.is_valid():
		return JsonResponse(tour_user_serializer.errors, status=400)
	tour_user_serializer.save()
	ic(data['host_id'])
	user= Users.objects.get(pk=data['host_id'])
	user.status = "Playing"
	user.save()
	return JsonResponse({'data': tour_serializer.data}, status=201)


def tournament_list(request):
	if request.method != 'GET':
		return JsonResponse({'message': 'Invalid request method.', 'method': request.method, 'data': {}}, status=405)
	elif request.method == 'GET':
		tournaments = Tournaments.objects.all()
		serializer = TournamentsSerializer(tournaments, many=True)
	return JsonResponse(serializer.data, safe=False, status=400)


@csrf_exempt
def tournament_update(request, tournament_id):
	if request.method != 'PATCH':	
		return JsonResponse({'message': 'Method not allowed', 'method': request.method, 'data': {}}, status=405)
	if request.content_type != 'application/json':
		return JsonResponse({'message': 'Only JSON allowed'}, status=406)

	request_data = JSONParser().parse(request)
	tournament = get_object_or_404(Tournaments, pk=tournament_id)
	tournament.status = request_data['status']

	serializer = TournamentsSerializer(tournament, data=request_data, partial=True)
	if serializer.is_valid():
		serializer.save()
		return JsonResponse(serializer.data)
	return JsonResponse(serializer.errors, status=400)
		

# @csrf_exempt
# def tournament_cancel(request, tournament_id):
# 	if request.method != 'DELETE':	
# 		return JsonResponse({'message': 'Method not allowed', 'method': request.method, 'data': {}}, status=405)

# 	tournament = get_object_or_404(Tournaments, pk=tournament_id)
# 	tournament.delete()
# 	response_data = {
# 		'message': f"'{tournament.name}' was deleted."
# 	}
# 	return JsonResponse(response_data, status=204)

#! --------------------------------------- Tournaments Users ---------------------------------------

@csrf_exempt
def tournament_join(request, tournament_id, user_id):
	if request.method != 'POST':	
		return JsonResponse({'message': 'Method not allowed', 'method': request.method, 'data': {}}, status=405)

	try:
		data = json.loads(request.body.decode('utf-8'))
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON', 'data': {}}, status=400)
	except KeyError as e:
		return JsonResponse({'message': f'Missing key: {str(e)}', 'data': {}}, status=400)

	data['tournament_id'] = tournament_id
	data['user_id'] = user_id
		
	serializer = TournamentsUsersSerializer(data=data)
	if not serializer.is_valid():
		return JsonResponse(serializer.errors, status=400)

	serializer.save()

	all_tour_users = TournamentsUsers.objects.filter(tournament_id=tournament_id)
	tournament = Tournaments.objects.get(pk=tournament_id)

	if all_tour_users.count() == tournament.capacity:
		games_data = []

		for i in range(0, tournament.capacity, 2):
			user1, user2 = all_tour_users[i], all_tour_users[i + 1]

			game = {
				'start_date':datetime.now().isoformat(),
				'user1_id': user1.user_id.id,
				'user2_id': user2.user_id.id,
				'tournament': True
			}
			games_data.append(game)
		
		serializer = GamesSerializer(data=games_data, many=True)
		if not serializer.is_valid():
			return JsonResponse(serializer.errors, status=400, safe=False)
		
		games = serializer.save()

		tour_games_data = []
		for game in games:
			tour_game = {
				'phase': first_tour_phase[tournament.capacity],
				'game_id': game.id,
				'tournament_id': tournament_id
			}

			tour_games_data.append(tour_game)
		tournament.status='Ongoing'
		tournament.save()
		serializer = TournamentsGamesSerializer(data=tour_games_data, many=True)
		if not serializer.is_valid():
			return JsonResponse(serializer.errors, status=400, safe=False)
		serializer.save()
	user = Users.objects.get(pk=user_id)
	user.status = "Playing"
	user.save()
	return JsonResponse({'data': serializer.data}, status=201, safe=False)


@csrf_exempt
def tournament_leave(request, tournament_id, user_id):
	if request.method != 'DELETE':	
		return JsonResponse({'message': 'Method not allowed', 'method': request.method, 'data': {}}, status=405)
	
	user_tour = get_object_or_404(TournamentsUsers, tournament_id=tournament_id, user_id=user_id)
	user_tour.delete()
	user = Users.objects.get(pk=user_id)
	user.status = "Online"
	user.save()
	response_data = {
		'message': f'User {user_tour.alias} left the tournament.'
	}
	return JsonResponse(response_data, status=204)

@csrf_exempt
def tournament_list_users(request, tournament_id):
	if request.method != 'GET':
		return JsonResponse({'message': 'Invalid request method.', 'method': request.method, 'data': {}}, status=405)

	tour_users = []
	users = TournamentsUsers.objects.filter(tournament_id=tournament_id)		
	serializer = TournamentsUsersSerializer(users, many=True)

	tour_users = serializer.data
	for tour_user in tour_users:
		user = Users.objects.get(pk=tour_user['user_id'])

		serializer = UsersSerializer(user)
		tour_user['user'] = serializer.data
		
	return JsonResponse(tour_users, safe=False)

#! --------------------------------------- Tournaments Games ---------------------------------------

@csrf_exempt
def tournament_list_games(request, tournament_id):
	if request.method != 'GET':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method, 'data': {}}, status=405)

	tgames = TournamentsGames.objects.filter(tournament_id=tournament_id)
	serializer = TournamentsGamesSerializer(tgames, many=True)
	tgames_list = serializer.data

	for tgame in tgames_list:
		game = Games.objects.get(pk=tgame['game_id'])
		serializer = GamesSerializer(game)
		tgame['game'] = serializer.data

	return JsonResponse(tgames_list, safe=False)


@csrf_exempt
def tournament_list_user_games(request, user_id):
	if request.method != 'GET':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method, 'data': {}}, status=405)

	# Get all TournamentsGames instances and respective Games instances
	temp = TournamentsGames.objects.all()
	temp_games = list(map(lambda x: x.game_id, temp))
	games = GamesSerializer(temp_games, many=True).data

	# For each TournamentsGames attach the Games instance for easier filtering
	all_tour_games = TournamentsGamesSerializer(temp, many=True).data
	for game, tgame in zip(games, all_tour_games):
		tgame['game'] = game

	# SELECT the TournamentsGames instances WHERE game.user1_id or game.user2_id is user_id
	user_tour_games = list(filter(lambda g: g['game']['user1_id'] == user_id or \
		g['game']['user2_id'] == user_id, all_tour_games))

	return JsonResponse(user_tour_games, status=200, safe=False)

#auxiliar function
@csrf_exempt
def tournament_list_user(request, user_id):
	if request.method != 'GET':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method, 'data': {}}, status=405)

	all_tour=TournamentsUsers.objects.filter(user_id=user_id)
	serializer = TournamentsUsersSerializer(all_tour, many=True)
	all_tourusers_list = serializer.data

	for touruser in all_tourusers_list:
		tournament = Tournaments.objects.get(pk=touruser['tournament_id'])
		serializer = TournamentsSerializer(tournament)
		touruser['tournament'] = serializer.data

	return JsonResponse(all_tourusers_list, safe=False)


@csrf_exempt
def tournament_update_game(request, tournament_id, game_id):
	if request.method != 'POST':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method, 'data': {}}, status=405)
	if request.content_type != 'application/json':
		return JsonResponse({'message': 'Only JSON allowed', 'data': {}}, status=406)

	data = {}

	try:
		data = json.loads(request.body.decode('utf-8'))
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON', 'data': {}}, status=400)
	except KeyError as e:
		return JsonResponse({'message': f'Missing key: {str(e)}', 'data': {}}, status=400)

	tour_game = TournamentsGames.objects.get(tournament_id=tournament_id, game_id=game_id)
	tour_game.game_id.duration = data['duration']
	tour_game.game_id.nb_goals_user1 = data['nb_goals_user1']
	tour_game.game_id.nb_goals_user2 = data['nb_goals_user2']


	# try:
	# 	player1 = TournamentsUsers.objects.get(user_id=tour_game.game_id.user1_id.id, tournament_id=tournament_id)
	# except TournamentsUsers.DoesNotExist:
	# 	return JsonResponse({'message': f'Player 1 not found in tournament {tournament_id}', 'data': {}}, status=404)

	# try:
	# 	player2 = TournamentsUsers.objects.get(user_id=tour_game.game_id.user2_id.id, tournament_id=tournament_id)
	# except TournamentsUsers.DoesNotExist:
	# 	return JsonResponse({'message': f'Player 2 not found in tournament {tournament_id}', 'data': {}}, status=404)

	player1 = TournamentsUsers.objects.get(
		user_id=tour_game.game_id.user1_id.id,
		tournament_id=tournament_id
	)
	player2 = TournamentsUsers.objects.get(
		user_id=tour_game.game_id.user2_id.id,
		tournament_id=tournament_id
	)

	player1.score += data['nb_goals_user1'] * 100
	player1.save()
	player2.score += data['nb_goals_user2'] * 100
	player2.save()

	if data['nb_goals_user1'] > data['nb_goals_user2']:
		tour_game.game_id.winner_id = player1.user_id
	else:
		tour_game.game_id.winner_id = player2.user_id
	tour_game.game_id.save()

	curr_phase = tour_game.phase
	curr_phase_matches = TournamentsGames.objects.filter(
		phase=curr_phase,
		tournament_id=tournament_id,
	)

	finished_matches = 0
	for match in curr_phase_matches:
		if match.game_id.winner_id is not None:
			finished_matches += 1

	if finished_matches == total_phase_matches[curr_phase] and curr_phase != 'Final':
		return advance_tournament_phase(curr_phase, tournament_id)
	elif finished_matches == total_phase_matches[curr_phase] and curr_phase == 'Final':
		return calculate_placements(tournament_id)
	
	data = TournamentsGamesSerializer(tour_game).data
	data['game'] = GamesSerializer(tour_game.game_id).data

	return JsonResponse(data, status=200)

#! --------------------------------------- Login42 ---------------------------------------

	
@csrf_exempt
def get_access_token(code):
    response = requests.post(settings.TOKEN_URL_A, data={
        'grant_type': 'authorization_code',
        'client_id': settings.CLIENT_ID_A,
        'client_secret': settings.CLIENT_SECRET_A,
        'redirect_uri': settings.REDIRECT_URI_A,
        'code': code,
    })
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get('access_token')
        ic(access_token)
        return access_token
    else:
        return None

def get_user_info(token):

    headers = {
        "Authorization": f"Bearer {token}"
    }
    user_info_response = requests.get(settings.USER_INFO_URL_A, headers=headers)

    if user_info_response.status_code == 200:
        return user_info_response.json()
    else:
        return None
	
def signin42(request):
	try:
		client_id = settings.CLIENT_ID_A
		
		authorization_url = f'https://api.intra.42.fr/oauth/authorize?client_id={client_id}&response_type=code&redirect_uri={settings.REDIRECT_URI_A}'
		ic(authorization_url)
		return HttpResponseRedirect(authorization_url)
	
	except Exception as e:
		return HttpResponseRedirect(settings.REDIRECT_URI_A or '/') 

def login42(request):
	authorization_code = request.GET.get('code')
	
	if authorization_code:
		access_token = get_access_token(authorization_code)
		
		if access_token:
			user_info = get_user_info(access_token)
			ic(user_info)
			
			if user_info:
				request.session['access_token'] = access_token
				request.session['user_info'] = user_info

				username = user_info.get('login')
				myuser = Users.objects.create_user(username=username, password="password")
				myuser.user_42 = user_info.get('id')
				myuser.email = user_info.get('email')
				myuser.picture = user_info.get('image', {}).get('versions', {}).get('medium')
				myuser.save()
				ic(myuser.picture)

				UserStats.objects.create(
					user_id=myuser
				)

				user = authenticate(username=username, password="password")

				if user is not None:
					myuser.status="Online"
					myuser.save()
					login(request, user)
					return redirect('home')
					# return JsonResponse({'message': 'Your account has been successfully created and you are now logged in.'}, status=201)
			else:
				return JsonResponse({'error': 'Failed to fetch user info', 'data': {}}, status=400)
		else:
			return JsonResponse({'error': 'Failed to exchange code for access token', 'data': {}}, status=400)


#! --------------------------------------- Pages ---------------------------------------

def signup(request):
	return render(request, 'pages/sign-up.html')

@csrf_exempt
def loginview(request):
	ic(request.method)
	if request.method == 'POST':
		try:
			data = json.loads(request.body) 
			username = data.get('username')
			password = data.get('password')

		except json.JSONDecodeError:
			return JsonResponse({'message': 'Invalid JSON.', 'data': {}}, status=400)

		user = authenticate(username=username, password=password)

		if user is not None:
			user.status = "Online"
			user.save()
			login(request, user)
			return JsonResponse({'message': 'You have successufly logged in.'}, status=201)

		else:
			return JsonResponse({'message': 'Bad Credentials.', 'data': {}}, status=400)

	return render(request, 'pages/login.html')


def resetpassword(request):
	return render(request, 'pages/password_reset.html')

def resetcode(request):
	return render(request, 'pages/reset_code.html')

def setnewpassword(request):
	return render(request, 'pages/set_new_password.html')

@login_required
def home(request):
	user_id = request.user.id  # Obtém o ID do usuário atual

	# Obtém a lista de amigos
	friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
	context = {
		'friends': friends,
		'user_id': user_id,
		'page': 'home'
	}
	return render(request, 'pages/home-view.html', context)



# acrescentar o campo do id 42 na tabela dos users [done]
# quando um utilizador da 42 loga se pela primeira vez tenho de guardar o id [done]
# tenho sempre que verificar se o id do user 42 existe na tabela e se sim usa aquele user para entrar
# caso contratio cria um novo

# login ou sign up normal nao e permitido para user que e user 42

# se o username da 42 ja existir temos de acrescentar um sufixo randomico



@login_required
def gamelocal(request):
	user_id = request.user.id
	context = {
		'user_id': user_id,
	}
	return render(request,'pages/gamelocal.html', context)

@login_required
def gameonline(request):
	user_id = request.user.id
	context = {
		'user_id': user_id,
	}
	return render(request,'pages/gameonline.html', context)

@login_required
def tournaments(request):
	user_id = request.user.id  # Obtém o ID do usuário atual

	# Obtém a lista de amigos
	friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
	tournaments = Tournaments.objects.exclude(status='Finished')

	num_tour_players = []
	for tournament in tournaments:
		num_tour_users = TournamentsUsers.objects.filter(tournament_id=tournament.id).count()
		num_tour_players.append(num_tour_users)
		
	stats_response = user_stats(request, user_id)
	stats = json.loads(stats_response.content)

	leaders = leaderboard(request)
	top_users = json.loads(leaders.content)
	current=current_place(request, user_id)
	ic(current_place)
	context = {
		'friends': friends,
		'user_id': user_id,
		'tournaments': zip(tournaments, num_tour_players),
		'stats': stats,
		'top_users': top_users,
		'current_place': current,
		'page': 'tournament',
	}
	return render(request,'pages/tournaments.html', context)

@login_required
def ongoingtournaments(request, tournament_id):
	user_id = request.user.id
	context = {
		'user_id': user_id,
		'tournament_id': tournament_id
	}
	return render(request,'pages/ongoing-tourn.html', context)

@login_required
@csrf_exempt
def signout(request):
	print("A função signout foi chamada")
	ic('aqui')
	user = Users.objects.get(pk=request.user.id)
	ic(user.username)  # Para depuração, imprime o nome de usuário
	ic(user.status)    # Para depuração, imprime o status

	user.status = "Offline"
	user.save()

	logout(request)

	return redirect('login')

#! --------------------------------------- Auxiliary ---------------------------------------

def advance_tournament_phase(previous_phase, tournament_id):
	next_phase = phase_shifts[previous_phase]
	prev_phase_games = TournamentsGames.objects.filter(tournament_id=tournament_id, phase=previous_phase)

	temp = []
	for i in range(0, len(prev_phase_games), 2):
		game1, game2 = prev_phase_games[i].game_id, prev_phase_games[i + 1].game_id
		winner1, winner2 = game1.winner_id, game2.winner_id

		game_data = {
			'start_date':datetime.now().isoformat(),
			'user1_id': winner1.id,
			'user2_id': winner2.id,
			'tournament': True
		}
		temp.append(game_data)

	serializer = GamesSerializer(data=temp, many=True)
	if not serializer.is_valid():
		return JsonResponse(serializer.errors, status=400, safe=False)
	new_games = serializer.save()
	new_games_data = serializer.data

	temp = []
	for new_game in new_games:
		tour_game = {
			'phase': next_phase,
			'game_id': new_game.id,
			'tournament_id': tournament_id
		}
		temp.append(tour_game)

	serializer = TournamentsGamesSerializer(data=temp, many=True)
	if not serializer.is_valid():
		return JsonResponse(serializer.errors, status=400, safe=False)
	serializer.save()
	
	new_phase_games_data = serializer.data
	for tour_game, game in zip(new_phase_games_data, new_games_data):
		tour_game['game'] = game
	
	return JsonResponse(new_phase_games_data, status=200, safe=False)

def calculate_placements(tournament_id):
	tour_users = TournamentsUsers.objects \
		.filter(tournament_id=tournament_id) \
		.order_by('-score')

	for i, user in enumerate(tour_users):
		user.placement = i + 1
		user.save()

		user1 = user.user_id 
		user1.status = "Online"
		user1.save()
	
	tournament = Tournaments.objects.get(pk=tournament_id)
	tournament.winner_id = tour_users.first().user_id
	tournament.status ='Finished'
	tournament.save()
	serializer = TournamentsUsersSerializer(tour_users, many=True)
	return JsonResponse(serializer.data, status=200, safe=False)