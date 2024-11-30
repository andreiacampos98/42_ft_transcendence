from django.shortcuts import render, get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.urls import reverse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from rest_framework_simplejwt.exceptions import InvalidToken
from django.conf import settings
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from rest_framework.parsers import JSONParser 
from django.urls import reverse
from django.core.mail import send_mail

from django.contrib.auth.decorators import login_required
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from datetime import datetime
from django.utils import timezone
from datetime import timedelta
from urllib.parse import unquote
from django.db.models.functions import TruncDay
import pyotp
import json, requests
from icecream import ic
from .models import Users
# Since we want to create an API endpoint for reading, creating, and updating 
# Company objects, we can use Django Rest Framework mixins for such actions.

from django.db.models import Q, Count, Case, When, IntegerField
from django.http import JsonResponse, HttpResponseRedirect
from .models import Users, Friends, Notifications, TournamentsUsers
from .serializers import *

from channels.db import database_sync_to_async

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


def validate_token(request):
    """Validates the access token in the request headers."""
    jwt_authenticator = JWTAuthentication()
    try:
        auth_result = jwt_authenticator.authenticate(request)
        if auth_result is None:
            return None
        user, validated_token = auth_result
        return user
    except InvalidToken as e:
        ic("Invalid Token:", str(e))
    except Exception as e:
        ic("Unknown error:", str(e))


def refresh_access_token(refresh_token):
    """Refreshes the access token using Django's JWT logic."""
    try:
        refresh = RefreshToken(refresh_token)
        new_access_token = str(refresh.access_token)
        return new_access_token
    except Exception as e:
        ic("Failed to refresh token:", str(e))
        return None


def check_token(request):
	if request.method == 'GET':
		ic("check")
		jwt_authenticator = JWTAuthentication()
		token_valid = None

		# Step 1: Attempt to authenticate the token
		try:
			auth_result = jwt_authenticator.authenticate(request)
			if auth_result:
				user, validated_token = auth_result
				token_valid = True 
		except Exception as e:
			# Token is likely invalid
			token_valid = False
		ic(token_valid)
		# Step 2: Refresh the token if invalid
		if not token_valid:
			ic(token_valid)
			ic("aqui1")
			refresh_token_value = request.COOKIES.get('refresh_token')
			
			if refresh_token_value:
				try:
					ic("aqui")
					refresh = RefreshToken(refresh_token_value)
					new_access_token = str(refresh.access_token)
					response_data = {'access_token': new_access_token}
					return JsonResponse(response_data, status=200)
				except Exception as e:
					return JsonResponse({'message': 'Failed to refresh token.'}, status=401)
			else:
				return JsonResponse({'message': 'Refresh token not found or expired.'}, status=401)

		# Step 3: If the token is valid, return a confirmation response
		return JsonResponse({'message': 'The token is valid.'}, status=200)
	return JsonResponse({'message': 'Invalid request method.', 'method': request.method}, status=405)

#! --------------------------------------- Users ---------------------------------------

def user_detail(request, pk):
	if request.method == 'GET':
		user = get_object_or_404(Users, pk=pk)
		serializer = UsersSerializer(user)
		return JsonResponse(serializer.data, safe=False)
	else:
		return JsonResponse({'message': 'Invalid request method.', 'method': request.method}, status=405)

def send_code_verify_email(request):
	if(request.method == 'POST'):
		try:
			data = json.loads(request.body) 
			email = data.get('email', '')
			if not email:
				return JsonResponse({'message': 'There is no value'}, status=400)
		except json.JSONDecodeError:
			return JsonResponse({'message': 'Invalid JSON.'}, status=400)
		totp=pyotp.TOTP(pyotp.random_base32(), interval=120)
		code = totp.now()
		if request.session.get('email_secret_key') is not None:
			del request.session['email_secret_key']
		if request.session.get('email_valid_date') is not None:
			del request.session['email_valid_date']
		request.session['email_secret_key'] = totp.secret
		valid_date = datetime.now() + timedelta(minutes=2) # data ate quando o codigo e valido
		request.session['email_valid_date'] = str(valid_date) 
		ic(code)
		send_mail(
			'Email Verification',
			f'Please use the following code to verify the email: {code}',
			settings.EMAIL_HOST_USER,
			[email],
			fail_silently=False,
		)
		return JsonResponse({'message': 'Code sent.'}, status=200)

class MockUser:
    def __init__(self, username, email):
        self.username = username
        self.email = email
        self._meta = self.MockMeta()

    class MockMeta:
        def get_field(self, field_name):
            if field_name == 'username':
                return self.MockField("Username")
            elif field_name == 'email':
                return self.MockField("Email")
            raise AttributeError(f"Unknown field: {field_name}")

        class MockField:
            def __init__(self, verbose_name):
                self.verbose_name = verbose_name

			
def user_create(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			email = data.get('email')
			username = data.get('username')
			password1 = data.get('password')
			password2 = data.get('reconfirm')
			ic([username, password1, password2])
		except json.JSONDecodeError:
			return JsonResponse({'message': 'Invalid JSON.'}, status=400)

		if not username or not email or not password1 or not password2:
			return JsonResponse({'message': 'All fields are required.'}, status=400)
		
		if len(username) < 5:
			return JsonResponse({'message': 'The Username needs to have more than 5 letters.'}, status=400)

		if Users.objects.filter(username=username).exists():
			return JsonResponse({'message': 'Username already exists! Please try another username.'}, status=400)

		try:
			user_mock = MockUser(username=username, email=email)
			validate_password(password1, user_mock)
		except ValidationError as e:
			return JsonResponse({'message': ' '.join(e)}, status=400)

		try:
			validate_email(email)
		except ValidationError:
			return JsonResponse({'message': 'Invalid email format.'}, status=400)
		
		if password1 != password2:
			return JsonResponse({'message': 'Passwords didn\'t match.'}, status=400)

		if not username.isalnum():
			return JsonResponse({'message': 'Username must be alphanumeric.'}, status=400)

		send_code_verify_email(request)
		return JsonResponse({'message': 'Email sent to verify the email'}, status=200)
	return JsonResponse({'message': 'Invalid request method.', 'method': request.method}, status=405)

def verifyemail(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body) 
			email = data.get('email')
			code = data.get('code')
			password1 = data.get('password')
			username = data.get('username')
			ic(email)
			ic(code)
		except json.JSONDecodeError:
			return JsonResponse({'message': 'Invalid JSON.'}, status=400)
		email_secret_key = request.session.get('email_secret_key')
		email_valid_date = request.session.get('email_valid_date')

		if email_secret_key and email_valid_date is not None:
			valid_date1 = datetime.fromisoformat(email_valid_date)
			ic(email_secret_key)
			ic(email_valid_date)
			ic(valid_date1)
			ic(datetime.now())
			if valid_date1 > datetime.now():
				totp1 = pyotp.TOTP(email_secret_key, interval=120)
				ic(totp1)
				ic(totp1.verify(code))
				if totp1.verify(code):
					if Users.objects.filter(username=username).exists():
						return JsonResponse({'message': 'Username already exists! Please try another username.'}, status=400)
					myuser = Users.objects.create_user(username=username, password=password1)
					myuser.email = email
					myuser.save()

					UserStats.objects.create(
						user_id=myuser
					)

					user = authenticate(username=username, password=password1)

					if user is not None:
						user_tokens = user.tokens()
						myuser.status="Online"
						myuser.save()
						login(request, user)
						response = JsonResponse({
							'message': 'Your account has been successfully created and you are now logged in.',
							'username': myuser.username,
							'redirect': True,
							'access_token': user_tokens.get('access'),
							'refresh_token': user_tokens.get('refresh')
						}, status=201)
						ic(user_tokens.get('refresh'))
						if request.session.get('email_secret_key') is not None:
							del request.session['email_secret_key']
						if request.session.get('email_valid_date') is not None:
							del request.session['email_valid_date']
						response.set_cookie(
							'refresh_token',
							user_tokens.get('refresh'),
							httponly=True, 
							secure=True, 
							samesite='Lax'   
						)
						return response
					return JsonResponse({'message': 'Can\'t create the user'}, status=400)
				else:
					return JsonResponse({'message': 'Invalid code'}, status=400)
			else:
				return JsonResponse({'message': 'Code has expired'}, status=400)
		else:
			return JsonResponse({'message': 'Ups, something went wrong'}, status=400)
	return render(request, 'pages/verifyemail.html')


def user_update(request, pk):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)
		
	user = get_object_or_404(Users, pk=pk)

	if request.method == 'POST':
		data = request.POST.copy()

		email = data.get('email', None)
		if email:
			try:
				validate_email(email)
				user.email=email
			except ValidationError:
				return JsonResponse({'message': 'Invalid email format.', 'access_token': new_token}, status=400)	
		if 'picture' in request.FILES:
			user.picture = request.FILES['picture']
		new_username = data.get('username', None)
		if Users.objects.filter(username=new_username).exists() and user.username != new_username:
			return JsonResponse({'message': 'Username already exists.', 'access_token': new_token}, status=400)

		description = data.get('description', None)

		if new_username:
			user.username = new_username
		if description:
			user.description = description
		user.save()
		ic("Aqui1")
		return JsonResponse({'message': 'User updated.', 'access_token': new_token }, status=201)
	else:
		return JsonResponse({'message': 'Invalid request method.', 'access_token': new_token, 'method': request.method}, status=405)


def user_password(request, pk):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)

	if request.method == 'POST':
		user = get_object_or_404(Users, pk=pk)
		old_password = request.POST.get('old_password')
		new_password1 = request.POST.get('password1')
		new_password2 = request.POST.get('password2')
		ic(old_password)
		ic(new_password1)
		ic(new_password2)

		if not user.check_password(old_password):
			return JsonResponse({'message': 'Old password is incorrect.', 'access_token': new_token}, status=400)

		if not new_password1:
			return JsonResponse({'message': 'New password is required.', 'access_token': new_token}, status=400)

		if user.check_password(new_password1):
			return JsonResponse({'message': 'New password cannot be the same as the old password.', 'access_token': new_token}, status=400)
		
		if new_password1 != new_password2:
			return JsonResponse({'message': 'Passwords did not match.', 'access_token': new_token}, status=400)

		try:
			validate_password(new_password1, user)
		except ValidationError as e:
			return JsonResponse({'message': ' '.join(e)}, status=400)
		
		user.set_password(new_password1)
		user.save()
		ic("user is saved")
		update_session_auth_hash(request, user)
		ic("update")
		return JsonResponse({'message': 'Password updated successfully', 'access_token': new_token}, status=200)
	else:
		return JsonResponse({'message': 'Invalid request method.', 'access_token': new_token, 'method': request.method}, status=405)


def search_suggestions(request):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)
		
	term = request.GET.get('term', '')
	if term:
		users = Users.objects.filter(username__icontains=term)[:5]
		
		serializer = UsersSerializer(users, many=True)
		response_data = {
			'access_token': new_token,
			'data': serializer.data,
		}
		return JsonResponse(response_data, safe=False)
	return JsonResponse([], safe=False)

def search_users(request):
	user_id = request.user.id
	friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
	term = request.GET.get('searched', '')
	userss = Users.objects.filter(username__icontains=term)
	return render(request, 'pages/search_users.html', {
		'searched': term,
		'userss': userss,
		'numbers': userss.count(),
		'friends': friends,
		'user_id': user_id
	})

#! --------------------------------------- Friends ---------------------------------------

def get_user_friends(request, user_id):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)
		
	if request.method == 'GET':
		friends = Friends.objects.filter(
			(Q(user1_id=user_id) | Q(user2_id=user_id)) & Q(accepted=True)
		)
		serializer = FriendsSerializer(friends, many=True)
		response_data = {
            'access_token': new_token,
            'friends': serializer.data,
        }
		return JsonResponse(response_data, safe=False)
	
	return JsonResponse({'message': 'Invalid request method.', 'access_token': new_token, 'method': request.method}, status=405)

def add_remove_friend(request, user1_id, user2_id):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)
		
	if request.method == 'POST':
		if user1_id == user2_id:
			return JsonResponse({'message': 'Users cannot be friends with themselves.', 'access_token': new_token}, status=400)
		
		if Friends.objects.filter(user1_id=user1_id, user2_id=user2_id).exists() or \
		Friends.objects.filter(user1_id=user2_id, user2_id=user1_id).exists():
			return JsonResponse({'message': 'Friendship already exists.', 'access_token': new_token}, status=400)

		user1 = get_object_or_404(Users, id=user1_id)
		user2 = get_object_or_404(Users, id=user2_id)

		friend = Friends.objects.create(user1_id=user1, user2_id=user2, accepted=False)
		notification = Notifications.objects.create(type='Friend Request', status='Pending', description=' has requested to be your friend.', user_id = user2, other_user_id = user1)
		notification.save()
		response_data = {
			'message': 'Friendship request sent successfully.',
			'access_token': new_token,
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
			return JsonResponse({'message': 'Friendship does not exist.', 'access_token': new_token}, status=404)

		friendship.delete()

		response_data = {
			'message': 'Friendship deleted successfully.', 
			'access_token': new_token,
		}
		return JsonResponse(response_data, status=200)
	return JsonResponse({'message': 'Invalid request method.', 'access_token': new_token, 'method': request.method}, status=405)


def accept_friend(request, user1_id, user2_id):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)
		
	if request.method == 'PATCH':
		friendship = Friends.objects.filter(
			(Q(user1_id=user1_id, user2_id=user2_id) | Q(user1_id=user2_id, user2_id=user1_id))
		).first()

		if not friendship:
			return JsonResponse({'message': 'Friendship does not exist.', 'access_token': new_token}, status=404)
		
		if friendship.accepted:
			return JsonResponse({'message': 'Friendship request has already been accepted.', 'access_token': new_token}, status=400)
		
		friendship.accepted = True
		friendship.save()
		user1 = get_object_or_404(Users, id=user1_id)
		user2 = get_object_or_404(Users, id=user2_id)
		notification = Notifications.objects.create(type='Accepted Friend Request', status='Pending', description=' has accepted your friend request!', user_id = user2, other_user_id = user1)
		notification.save()
		response_data = {
			'message': 'User accept the request.',
			'access_token': new_token,
		}
		return JsonResponse(response_data, status=200)
	return JsonResponse({'message': 'Invalid request method.', 'access_token': new_token, 'method': request.method}, status=405)


def decline_friend(request, user1_id, user2_id):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)
		
	if request.method == 'PATCH':
		friendship = Friends.objects.filter(
			(Q(user1_id=user1_id, user2_id=user2_id) | Q(user1_id=user2_id, user2_id=user1_id))
		).first()

		if not friendship:
			return JsonResponse({'message': 'Friendship does not exist.', 'access_token': new_token}, status=404)
			
		friendship.delete()
		user1 = get_object_or_404(Users, id=user1_id)
		user2 = get_object_or_404(Users, id=user2_id)
		notification = Notifications.objects.create(type='Accepted Friend Request', status='Pending', description=' has decline your friend request!', user_id = user2, other_user_id = user1)
		notification.save()
		response_data = {
			'message': 'User decline the request.',
			'access_token': new_token,
		}
		return JsonResponse(response_data, status=200)
	return JsonResponse({'message': 'Invalid request method.', 'access_token': new_token, 'method': request.method}, status=405)

#! --------------------------- Notifications ----------------------------------

def get_user_notifications(request, user_id):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)
		
	if request.method == 'GET':
		notifications = Notifications.objects.filter(user_id = user_id).order_by('-created_at')
		serializer = NotificationsSerializer(notifications, many=True)
		response_data = {
			'access_token': new_token,
			'notifications': serializer.data
		}
		return JsonResponse(response_data, safe=False)
	return JsonResponse({'message': 'Invalid request method.', 'access_token': new_token, 'method': request.method}, status=405)


def delete_user_notification(request, user_id, notif_id):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)

	if request.method == 'DELETE':
		notifications = Notifications.objects.filter(Q(user_id = user_id) & Q( id = notif_id))
		notifications.delete()
		response_data = {
			'message': 'Notification deleted.',
			'access_token': new_token,
		}
		return JsonResponse(response_data, status=200)
	return JsonResponse({'message': 'Invalid request method.', 'access_token': new_token, 'method': request.method}, status=405)


def update_notification(request, notif_id):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)

	if request.method == 'PATCH':
		notifications = Notifications.objects.get(id = notif_id)
		notifications.status = 'Read'
		notifications.save()
		response_data = {
			'message': 'Status of notification updated.',
			'access_token': new_token,
		}
		return JsonResponse(response_data, status=200)
	return JsonResponse({'message': 'Invalid request method.', 'access_token': new_token, 'method': request.method}, status=405)

#! --------------------------------------- User Stats ---------------------------------------

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
			if data['quickest_game'] == 2147483647:
				data['quickest_game'] = 0 
			return JsonResponse(data, status=200)
		except UserStats.DoesNotExist:
			return JsonResponse({'message': 'UserStats not found.'}, status=404)
	return JsonResponse({'message': 'Method not allowed'}, status=405)

def leaderboard(request):
	if request.method == 'GET':
		top_users = UserStats.objects.all().order_by('-nb_tournaments_won')[:3]

		enriched_top_users = []
		for top_user in top_users:
			user = Users.objects.get(pk=top_user.user_id.id) 

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


def user_stats_update(user_id, game_id, data):

	stats = UserStats.objects.get(user_id=user_id)
	if not stats:
		return JsonResponse({'message': 'User stats not found'}, status=404)
	
	game = Games.objects.get(pk=game_id)
	if game.user1_id.id == user_id:
		stats.nb_goals_scored += data['nb_goals_user1']
		stats.nb_goals_suffered += data['nb_goals_user2']
		if data['user1_stats']['scored_first']:
			stats.num_first_goals += 1
		if data['nb_goals_user1'] > data['nb_goals_user2']:
			stats.nb_games_won += 1
	else:
		stats.nb_goals_scored += data['nb_goals_user2']
		stats.nb_goals_suffered += data['nb_goals_user1']
		if data['user2_stats']['scored_first']:
			stats.num_first_goals += 1
		if data['nb_goals_user2'] > data['nb_goals_user1']:
			stats.nb_games_won += 1
	
	stats.nb_games_played += 1
	if game.type == "Remote":
		stats.remote_time_played += data['duration']
	elif game.type == "Local":
		stats.local_time_played += data['duration']
	elif game.type == "AI":
		stats.ai_time_played += data['duration']

	if data['game_stats']['max_ball_speed'] > stats.max_ball_speed:
		stats.max_ball_speed = data['game_stats']['max_ball_speed']
		stats.date_max_ball_speed = game.created_at
	if data['game_stats']['longer_rally'] > stats.max_rally_length:
		stats.max_rally_length = data['game_stats']['longer_rally']
		stats.date_max_rally_length = game.created_at
	if data['duration'] < stats.quickest_game :
		stats.quickest_game = data['duration']
		stats.date_quickest_game = game.created_at
	if data['duration'] > stats.longest_game:
		stats.longest_game = data['duration']
		stats.date_longest_game = game.created_at
	stats.save()
	data_stats = UserStatsSerializer(stats)
	return JsonResponse({'message': 'User stats updated successfully', 'data': data_stats.data}, status=200)

def win_rate_nb_games_day(request, user_id):
	today = timezone.now()
	seven_day_before = today - timedelta(days=7)
	games = Games.objects.filter((Q(user1_id = user_id) | Q(user2_id = user_id)) & Q(created_at__gte=seven_day_before) 
							& ~Q(type='Tournament')).order_by('-created_at')

	stats = games.annotate(day=TruncDay('created_at')).values('day').annotate(
		total_games=Count('id'), ).annotate(
		win_rate=Case(
			When(total_games=0, then=0), 
			default=(100 * Count(Case(When(winner_id=user_id, then=1))) / Count('id')),
			output_field=IntegerField()
		)
		).order_by('-day')

	return JsonResponse(list(stats), safe=False) 

def user_stats_all(request):
	if request.method != 'GET':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method}, status=405)
	elif request.method == 'GET':
		stats = UserStats.objects.all()
		data_stats = UserStatsSerializer(stats, many=True)
		return JsonResponse({'message': 'All users stats', 'data': data_stats.data}, status=200)
	return JsonResponse({'message': 'All users stats' }, safe=False, status=400)


#! --------------------------------------- Game Stats ---------------------------------------

def game_stats_create(game_id, data):
	game = Games.objects.get(pk=game_id)
	game_stats, created = GamesStats.objects.get_or_create(game=game)
	game_stats.average_rally = data['game_stats']['average_rally'] 
	game_stats.longer_rally = data['game_stats']['longer_rally']
	game_stats.shorter_rally = data['game_stats']['shorter_rally']
	game_stats.max_ball_speed = data['game_stats']['max_ball_speed']
	game_stats.min_ball_speed = data['game_stats']['min_ball_speed']
	game_stats.average_ball_speed = data['game_stats']['average_ball_speed']
	game_stats.greatest_deficit_overcome = data['game_stats']['greatest_deficit_overcome']
	game_stats.gdo_user = Users.objects.get(pk=data['game_stats']['gdo_user'])
	game_stats.most_consecutive_goals = data['game_stats']['most_consecutive_goals']
	game_stats.mcg_user = Users.objects.get(pk=data['game_stats']['mcg_user'])
	game_stats.biggest_lead = data['game_stats']['biggest_lead']
	game_stats.bg_user = Users.objects.get(pk=data['game_stats']['bg_user'])

	game_stats.save()
	return JsonResponse({'message': 'Game Stats updated.'}, status=201)


def game_stats(request, game_id):
	if request.method !='GET':
		return JsonResponse({'message': 'Method not allowed'}, status=405)
	if request.method == 'GET':
		try:
			stats = GamesStats.objects.get(game=game_id)
			serializer = GamesStatsSerializer(stats)
			data = serializer.data
			return JsonResponse(data, safe=False, status=200)
		except GamesStats.DoesNotExist:
			return JsonResponse({'message': 'GamesStats not found.'}, status=404)


def game_stats_all(request):
	if request.method != 'GET':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method}, status=405)
	elif request.method == 'GET':
		stats = GamesStats.objects.all()
		data_stats = GamesStatsSerializer(stats, many=True)
		return JsonResponse({'message': 'All games stats', 'data': data_stats.data}, status=200)
	return JsonResponse({'message': 'All games stats' }, safe=False, status=400)

#! --------------------------------------- Goals ---------------------------------------
def game_goals_create(game_id, data):
	game =Games.objects.get(pk=game_id)
	for goal_data in data['goals']:
		timestamp_str = goal_data['timestamp'].replace('Z', '+00:00')
		timestamp = datetime.fromisoformat(timestamp_str)

		goals_create = Goals.objects.create(
			game=game,
			timestamp=timestamp,  
			user=Users.objects.get(pk=goal_data['user']),
			rally_length=goal_data['rally_length'],
			ball_speed=goal_data['ball_speed']
		)

	return JsonResponse({'message': 'Goals added.'}, status=201)


def game_goals(request, game_id):
	if request.method !='GET':
		return JsonResponse({'message': 'Method not allowed'}, status=405)
	if request.method == 'GET':
		try:
			stats = Goals.objects.filter(game=game_id)
			serializer = GoalsSerializer(stats, many=True)
			data = serializer.data
			return JsonResponse(data, safe=False, status=200)
		except Goals.DoesNotExist:
			return JsonResponse({'message': 'Goals not found.'}, status=404)

def game_goals_all(request):
	if request.method != 'GET':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method}, status=405)
	elif request.method == 'GET':
		stats = Goals.objects.all()
		data_stats = GoalsSerializer(stats, many=True)
		return JsonResponse({'message': 'All goals', 'data': data_stats.data}, status=200)
	return JsonResponse({'message': 'No goals' }, safe=False, status=400)

#! --------------------------------------- Games ---------------------------------------
def game_create_helper(data: dict):
	serializer = GamesSerializer(data=data)
	data['start_date'] = datetime.now().isoformat()

	if not serializer.is_valid():
		return JsonResponse(serializer.errors, status=400)

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


def game_create(request=None):
	if request.method != 'POST':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method}, status=405)
	if request.content_type != 'application/json':
		return JsonResponse({'message': 'Only JSON allowed'}, status=406)

	data = {}

	try:
		data = json.loads(request.body.decode('utf-8'))
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)
	except KeyError as e:
		return JsonResponse({'message': f'Missing key: {str(e)}'}, status=400)

	return game_create_helper(data)


def game_update_helper(data, game_id):
	game = Games.objects.get(pk=game_id)
	game.duration = data['duration']
	game.nb_goals_user1 = data['nb_goals_user1']
	game.nb_goals_user2 = data['nb_goals_user2']

	player1 = Users.objects.get(pk=game.user1_id.id)
	player1.status = "Online"
	player1.save()

	player2 = None
	if game.type != "Local":
		player2 = Users.objects.get(pk=game.user2_id.id)
		player2.status = "Online"
		player2.save()
		
	if data['nb_goals_user1'] > data['nb_goals_user2']:
		game.winner_id = player1
	else:
		game.winner_id = player2
	game.save()

	user_stats_update(player1.id, game_id, data)
	if game.type != "Local":
		user_stats_update(player2.id, game_id, data)
		game_stats_create(game_id, data)
		game_goals_create(game_id, data)

	data = GamesSerializer(game).data
	return JsonResponse(data, status=200)
	
def game_update(request, game_id):
	if request.method != 'POST':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method}, status=405)
	if request.content_type != 'application/json':
		return JsonResponse({'message': 'Only JSON allowed'}, status=406)

	data = {}

	try:
		data = json.loads(request.body.decode('utf-8'))['data']
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)
	except KeyError as e:
		return JsonResponse({'message': f'Missing key: {str(e)}'}, status=400)

	return game_update_helper(data, game_id)


def get_game(request, game_id):
	if request.method !='GET':
		return JsonResponse({'message': 'Method not allowed'}, status=405)
	try:
		game = Games.objects.get(id=game_id)
		serializer = GamesSerializer(game)
		data = serializer.data
		data['user1_id'] = UsersSerializer(game.user1_id).data	
		data['user2_id'] = UsersSerializer(game.user2_id).data	
		return JsonResponse({'message': 'Game Info', 'data': data}, status=200)
	except Games.DoesNotExist:
		return JsonResponse({'message': 'Game not found.'}, status=404)


#! --------------------------------------- Tournaments ---------------------------------------


def tournament_create(request):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)
		
	if request.method != 'POST':
		return JsonResponse({'message': 'Method not allowed', 'access_token': new_token, 'method': request.method})

	try:
		data = json.loads(request.body.decode('utf-8'))
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON', 'access_token': new_token}, status=400)
	except KeyError as e:
		return JsonResponse({'message': f'Missing key: {str(e)}', 'access_token': new_token}, status=400)
	
	name = data.get('name', '')
	nickname = data.get('alias', '')

	if name == '':
		return JsonResponse({'message': 'The name is blank', 'access_token': new_token}, status=400)
	if nickname == '':
		return JsonResponse({'message': 'The nickname is blank', 'access_token': new_token}, status=400)

	if len(name) > 64:
		return JsonResponse({'message': 'The name of the tournament is too long.', 'access_token': new_token}, status=400)
	
	if len(nickname) > 64:
		return JsonResponse({'message': 'The nickname is too long.', 'access_token': new_token}, status=400)

	tour_serializer = TournamentsSerializer(data=data)
	if not tour_serializer.is_valid():
		return JsonResponse({'message': 'Error in the serializer.', 'tour errors': tour_serializer.errors, 'access_token': new_token}, status=400)

	tournament = tour_serializer.save()
	user_data = {
		'alias': data['alias'],
		'user_id': data['host_id'],
		'tournament_id': tournament.id
	}

	tour_user_serializer = TournamentsUsersSerializer(data=user_data)
	if not tour_user_serializer.is_valid():
		return JsonResponse({'message': 'Error in the serializer.', 'tour errors': tour_user_serializer.errors, 'access_token': new_token}, status=400)
	tour_user_serializer.save()
	ic(data['host_id'])
	user= Users.objects.get(pk=data['host_id'])
	user.status = "Playing"
	user.save()
	return JsonResponse({'data': tour_serializer.data, 'access_token': new_token}, status=201)


def tournament_list(request):
	if request.method != 'GET':
		return JsonResponse({'message': 'Invalid request method.', 'method': request.method}, status=405)
	elif request.method == 'GET':
		tournaments = Tournaments.objects.all()
		serializer = TournamentsSerializer(tournaments, many=True)
	return JsonResponse(serializer.data, safe=False, status=400)


def tournament_update(request, tournament_id):
	if request.method != 'PATCH':	
		return JsonResponse({'message': 'Method not allowed', 'method': request.method}, status=405)
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
	

#! --------------------------------------- Tournaments Users ---------------------------------------

def tournament_init_phase(tournament_id):
	tournament = Tournaments.objects.get(pk=tournament_id)
	all_tour_users = TournamentsUsers.objects.filter(tournament_id=tournament_id)

	games_data = []

	for i in range(0, tournament.capacity, 2):
		user1, user2 = all_tour_users[i], all_tour_users[i + 1]

		game = {
			'start_date':datetime.now().isoformat(),
			'user1_id': user1.user_id.id,
			'user2_id': user2.user_id.id,
			'type': "Tournament",
		}
		games_data.append(game)
	
	serializer = GamesSerializer(data=games_data, many=True)
	if not serializer.is_valid():
		return None
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
		return None
	
	return serializer.save()

def tournament_join(request, tournament_id, user_id):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)

	if request.method != 'POST':	
		return JsonResponse({'message': 'Method not allowed', 'method': request.method, 'access_token': new_token}, status=405)

	try:
		data = json.loads(request.body.decode('utf-8'))
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON', 'access_token': new_token}, status=400)
	except KeyError as e:
		return JsonResponse({'message': f'Missing key: {str(e)}', 'access_token': new_token}, status=400)

	data['tournament_id'] = tournament_id
	data['user_id'] = user_id
	nickname = data.get('alias', '')
	ic(nickname)
	if nickname == '':
		return JsonResponse({'message': 'The nickname is blank', 'access_token': new_token}, status=400)
	if len(nickname) > 64:
		return JsonResponse({'message': 'The nickname is too long.', 'access_token': new_token}, status=400)
		
	serializer = TournamentsUsersSerializer(data=data)
	if not serializer.is_valid():
		return JsonResponse(serializer.errors, status=400)
	serializer.save()
	
	user = Users.objects.get(pk=user_id)
	user.status = "Playing"
	user.save()
	return JsonResponse({'data': serializer.data, 'access_token': new_token}, status=201, safe=False)


@database_sync_to_async
def tournament_leave(tournament_id, user_id):	
	user_tour = get_object_or_404(TournamentsUsers, tournament_id=tournament_id, user_id=user_id)
	user_tour.delete()
	user = Users.objects.get(pk=user_id)
	user.status = "Online"
	user.save()

def tournament_leave_1(request, tournament_id, user_id):	
	user_tour = get_object_or_404(TournamentsUsers, tournament_id=tournament_id, user_id=user_id)
	user_tour.delete()
	user = Users.objects.get(pk=user_id)
	user.status = "Online"
	user.save()
	return JsonResponse({'message': 'The user leave the tournament'}, status=201)

def tournament_list_users(request, tournament_id):
	if request.method != 'GET':
		return JsonResponse({'message': 'Invalid request method.', 'method': request.method}, status=405)

	tour_users = []
	users = TournamentsUsers.objects.filter(tournament_id=tournament_id)		
	serializer = TournamentsUsersSerializer(users, many=True)

	tour_users = serializer.data
	for tour_user in tour_users:
		user = Users.objects.get(pk=tour_user['user_id'])

		serializer = UsersSerializer(user)
		tour_user['user'] = serializer.data
		
	return JsonResponse(tour_users, safe=False)

def list_user_tournaments(user_id):
	user_tourn_accs = TournamentsUsers.objects.filter(user_id=user_id)
	user_tourns = []

	for acc in user_tourn_accs: 
		tournament = Tournaments.objects.get(pk=acc.tournament_id.id)
		user_tourns.append(tournament)

	return zip(user_tourns, user_tourn_accs)

#! --------------------------------------- Tournaments Games ---------------------------------------

def tournament_list_games(request, tournament_id):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)
		
	if request.method != 'GET':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method, 'access_token': new_token}, status=405)

	tgames = TournamentsGames.objects.filter(tournament_id=tournament_id)
	serializer = TournamentsGamesSerializer(tgames, many=True)
	tgames_list = serializer.data
	for tgame in tgames_list:
		try:
			game = Games.objects.get(pk=tgame['game_id'])
			game_serializer = GamesSerializer(game)
			tgame['game'] = game_serializer.data
			
			winner = Users.objects.get(pk=game.winner_id.id) if game.winner_id else None
			user1 = Users.objects.get(pk=game.user1_id.id)
			user2 = Users.objects.get(pk=game.user2_id.id)

			tgame['game']['winner'] = UsersSerializer(winner).data if winner else None
			tgame['game']['user1'] = UsersSerializer(user1).data
			tgame['game']['user2'] = UsersSerializer(user2).data


		except Games.DoesNotExist:
			return JsonResponse({'message': 'Game not found', 'access_token': new_token}, status=404)
		except Users.DoesNotExist as e:
			return JsonResponse({'message': 'User not found', 'message': str(e), 'access_token': new_token}, status=404)
		except Exception as e:
			return JsonResponse({'message': 'An error occurred', 'message': str(e), 'access_token': new_token}, status=500)

	return JsonResponse({'games': tgames_list, 'access_token': new_token}, safe=False)



def tournament_list_user_games(request, user_id):
	if request.method != 'GET':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method}, status=405)

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

def tournament_list_user(request, user_id):
	if request.method != 'GET':
		return JsonResponse({'message': 'Method not allowed', 'method': request.method}, status=405)

	all_users = TournamentsUsers.objects.filter(user_id=user_id)
	serializer = TournamentsUsersSerializer(all_users, many=True)
	all_user_tours = serializer.data

	for touruser in all_user_tours:
		tournament = Tournaments.objects.get(pk=touruser['tournament_id'])
		serializer = TournamentsSerializer(tournament)
		touruser['tournament'] = serializer.data

	all_user_tours.sort(reverse=True, key=lambda t: t['created_at'])

	return JsonResponse(all_user_tours, safe=False)


def tournament_update_game_helper(tournament_id, game_id, data):
	tour_game = TournamentsGames.objects.get(tournament_id=tournament_id, game_id=game_id)
	game_update_helper(data, game_id)

	player1 = TournamentsUsers.objects.get(
		user_id=tour_game.game_id.user1_id.id,
		tournament_id=tournament_id
	)
	player2 = TournamentsUsers.objects.get(
		user_id=tour_game.game_id.user2_id.id,
		tournament_id=tournament_id
	)
	user1 = Users.objects.get(pk=tour_game.game_id.user1_id.id)
	user2 = Users.objects.get(pk=tour_game.game_id.user2_id.id)

	player1.score += data['nb_goals_user1'] * 100
	player1.save()
	player2.score += data['nb_goals_user2'] * 100
	player2.save()

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
		tournament = Tournaments.objects.filter(id=tournament_id).first()
		tournament.duration = datetime.timestamp(datetime.now())- tournament.created_at.timestamp()
		tournament.save()
		return calculate_placements(tournament_id)
	
	data = TournamentsGamesSerializer(tour_game).data
	data['game'] = GamesSerializer(tour_game.game_id).data

	return JsonResponse(data, status=200)

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

	return tournament_update_game_helper(tournament_id, game_id, data)


#! --------------------------------------- Login42 ---------------------------------------


def get_access_token(host, code):
	response = requests.post(settings.TOKEN_URL_A, data={
		'grant_type': 'authorization_code',
		'client_id': settings.CLIENT_ID_A,
		'client_secret': settings.CLIENT_SECRET_A,
		'redirect_uri': f'https://{host}/home42/',
		'code': code,
	})
	ic(response.text)
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
		uri = request.build_absolute_uri('/home42/')
		authorization_url = f'https://api.intra.42.fr/oauth/authorize?client_id={client_id}&response_type=code&redirect_uri={uri}'
		return HttpResponseRedirect(authorization_url)
	
	except Exception as e:
		return HttpResponseRedirect('/') 

def login42(request):
	authorization_code = request.GET.get('code')
	
	if authorization_code is None:
		return JsonResponse({'message': 'Authorization code missing'}, status=400)

	access_token = get_access_token(request.get_host(), authorization_code)
	if access_token is None:
		return JsonResponse({'message': 'Failed to get access token'}, status=400)

	user_info = get_user_info(access_token)
	if not user_info:
		return JsonResponse({'message': 'Failed to get user info'}, status=400)

	request.session['access_token'] = access_token
	request.session['user_info'] = user_info

	username = user_info.get('login')
	id42 = user_info.get('id')

	# Verifique se o usuário já existe no banco de dados
	searchuser = Users.objects.filter(user_42=id42)

	if searchuser.exists():
		user = searchuser.first()
		user = authenticate(username=user.username, password="password")
		if user is not None:
			user_tokens = user.tokens()
			user.status = "Online"
			user.save()
			login(request, user)

			response = HttpResponseRedirect(reverse('home')) 
			response.set_cookie(
				'refresh_token',
				user_tokens.get('refresh'),
				httponly=False, 
				secure=True, 
				samesite='Lax',
				max_age=3600
			)
			response.set_cookie(
				'access_token',
				user_tokens.get('access'),
				httponly=False, 
				secure=True, 
				samesite='Lax',
				max_age=120 
			)
			# Redireciona o usuário para a URL com os tokens
			return response
	else:
		# Caso o usuário não exista, crie um novo
		i = 0
		original_username = username 
		while Users.objects.filter(username=username).exists():
			i += 1
			username = f"{original_username}{i}"

		# Criação do novo usuário
		myuser = Users.objects.create_user(username=username, password="password")
		myuser.user_42 = id42
		myuser.email = user_info.get('email')
		myuser.picture = user_info.get('image', {}).get('versions', {}).get('medium')
		ic(myuser.picture)
		ic(myuser.picture.url)
		myuser.save()

		UserStats.objects.create(user_id=myuser)

		user = authenticate(username=username, password="password")
		if user is not None:
			user_tokens = myuser.tokens()
			myuser.status = "Online"
			myuser.save()
			login(request, user)

		
			response = HttpResponseRedirect(reverse('home')) 
			response.set_cookie(
				'refresh_token',
				user_tokens.get('refresh'),
				httponly=False, 
				secure=True, 
				samesite='Lax',
				max_age=3600
			)
			response.set_cookie(
				'access_token',
				user_tokens.get('access'),
				httponly=False, 
				secure=True, 
				samesite='Lax',
				max_age=120
			)
			# Redireciona o usuário para a URL com os tokens
			return response

	return JsonResponse({'message': 'User login failed'}, status=400)

#! --------------------------------------- 2FA ---------------------------------------

def send_otp(request):
	username = request.session['username']
	user = Users.objects.get(username=username)
	if not user:
		return JsonResponse({'message': 'There is no user'}, status=400)
	totp=pyotp.TOTP(pyotp.random_base32(), interval=120) #a password e valida durante 120 segundos
	otp = totp.now()
	if request.session.get('otp_secret_key') is not None:
		del request.session['otp_secret_key']
	if request.session.get('otp_valid_date') is not None:
		del request.session['otp_valid_date']
	request.session['otp_secret_key'] = totp.secret
	valid_date = datetime.now() + timedelta(minutes=2) # data ate quando o codigo e valido
	request.session['otp_valid_date'] = str(valid_date) 
	ic(otp)
	send_mail(
		'Email Verification OTP',
		f'Your OTP for email verification is: {otp}',
		settings.EMAIL_HOST_USER,
		[user.email],
		fail_silently=False,
	)
	return JsonResponse({'message': 'Code was sent'}, status=200)


def toggle2fa(request, user_id):
	token_valid = validate_token(request)
	new_token = request.headers['Authorization'].replace('Bearer ', '')
	if token_valid is None:
		refresh_token = request.COOKIES.get('refresh_token')
		new_token = refresh_access_token(refresh_token)
		if new_token is None:
			ic("invalid token")
			return JsonResponse({'message': "Invalid refresh token"}, status=401)
		
	if request.method == 'POST':
		try:
			data = json.loads(request.body) 
			enabled = data.get('enabled')

		except json.JSONDecodeError:
			return JsonResponse({'message': 'Invalid JSON.', 'access_token': new_token}, status=400)
		ic(enabled)
		user = Users.objects.get(pk=user_id)
		user.two_factor = enabled
		user.save()
		return JsonResponse({'message': 'User enable/disable two factor authentication.', 'access_token': new_token}, status=200)
	return JsonResponse({'message': 'Method not allowed', 'method': request.method, 'access_token': new_token}, status=405)


#! --------------------------------------- Pages ---------------------------------------

def signup(request):
	return render(request, 'pages/sign-up.html')


def loginview(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body) 
			username = data.get('username')
			password = data.get('password')

		except json.JSONDecodeError:
			return JsonResponse({'message': 'Invalid JSON.'}, status=400)

		user42 = Users.objects.filter(username=username).first()
		if user42 is None:
			return JsonResponse({'message': 'User didn\'t exist.'}, status=400)

		if user42.user_42 is not None:
			return JsonResponse({'message': 'User 42 detected. Please sign in with 42.'}, status=400)

		user = authenticate(username=username, password=password)

		if user is not None:
			user.status = "Online"
			user.save()
			if user.two_factor:
				request.session['username'] = username
				send_otp(request)
				response_data = {
					'message': 'You have successfully logged in.',
					'username': user.username,
					'redirect_url': 'home',
					'data': {'otp': True }
				}
				
				response = JsonResponse(response_data, status=201)
				return response
			user_tokens = user.tokens()
			login(request, user)
			response_data = {
				'message': 'You have successfully logged in.',
				'username': user.username,
				'access_token': user_tokens.get('access'),
				'refresh_token': user_tokens.get('refresh'),
				'redirect_url': 'home',
				'data': {'home': True }
			}
			
			response = JsonResponse(response_data, status=201)

			response.set_cookie(
				'refresh_token',
				user_tokens.get('refresh'),
				httponly=True, 
				secure=True, 
				samesite='Lax'
			)

			return response
		else:
			return JsonResponse({'message': 'Bad Credentials.'}, status=400)

	return render(request, 'pages/login.html')


def otp_view(request):
	if request.method == 'POST':
		otp = request.POST.get('otp')		
		username = request.session.get('username')
		otp_secret_key = request.session.get('otp_secret_key')
		otp_valid_date = request.session.get('otp_valid_date')

		ic(otp)
		ic(otp_secret_key)
		ic(otp_valid_date)

		if otp_secret_key and otp_valid_date is not None:
			valid_date = datetime.fromisoformat(otp_valid_date)
			if valid_date > datetime.now():
				totp = pyotp.TOTP(otp_secret_key, interval=120)
				ic(totp)
				ic(totp.verify(otp))
				if totp.verify(otp):
					user = get_object_or_404(Users, username=username)
					user_tokens = user.tokens()
					response = JsonResponse({
						'redirect': True, 
						'access_token': user_tokens.get('access'),
						'refresh_token': user_tokens.get('refresh')
					}, status=200)
					login(request, user)

					del request.session['otp_secret_key']
					del request.session['otp_valid_date']

					response.set_cookie(
							'refresh_token',
							user_tokens.get('refresh'),
							httponly=True, 
							secure=True, 
							samesite='Lax'   
						)

					return response
				else:
					return JsonResponse({'message': 'Invalid one-time password'}, status=400)
			else:
				return JsonResponse({'message': 'One-time password has expired'}, status=400)
		else:
			return JsonResponse({'message': 'Ups, something went wrong'}, status=400)

	return render(request, 'pages/otp.html')


@login_required
def home(request):
	if 'username' in request.session:
		del request.session['username']
	user_id = request.user.id 

	friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
	context = {
		'friends': friends,
		'user_id': user_id,
		'page': 'home'
	}
	return render(request, 'pages/home-view.html', context)

@login_required
def gamelocal(request):
	user_id = request.user.id
	friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
	user_id = request.user.id
	context = {
		'friends': friends,
		'user_id': user_id,
	}
	return render(request,'pages/gamelocal.html', context)

@login_required
def gameonline(request):
	user_id = request.user.id
	friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
	user_id = request.user.id
	context = {
		'user_id': user_id,
		'friends': friends,
	}
	return render(request,'pages/gameonline.html', context)

@login_required
def gametournament(request):
	user_id = request.user.id
	friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
	user_id = request.user.id
	context = {
		'user_id': user_id,
		'friends': friends,
	}
	return render(request,'pages/gametournament.html', context)

@login_required
def tournaments(request):
	user_id = request.user.id 

	act_user = Users.objects.filter(id=user_id)
	friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
	tournaments = Tournaments.objects.exclude(status='Finished') \
		.order_by('-created_at')

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
		'act_user':act_user,
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
	friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
	tournament = Tournaments.objects.get(pk=tournament_id)
	context = {
		'user_id': user_id,
		'friends': friends,
		'tournament': TournamentsSerializer(tournament).data,
		'tournament_id': tournament_id,
		'tournament_size': tournament.capacity,
		'tournament_name': tournament.name
	}
	return render(request,'pages/ongoing-tourn.html', context)

@login_required
def tournamentstats(request, tournament_id):
	user_id = request.user.id
	friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
	tournament = Tournaments.objects.get(pk=tournament_id)
	tour_users = TournamentsUsers.objects.filter(tournament_id=tournament_id).order_by('placement')
	tour_games = TournamentsGames.objects.filter(tournament_id=tournament_id).order_by('pk')
	context = {
		'friends': friends,
		'tournament_id': tournament_id,
		'tournament_size': tournament.capacity,
		'tournament_name': tournament.name,
		'tour_users': tour_users,
		'tour_games': tour_games,
		'user_id': user_id
	}
	ic(context)
	return render(request,'pages/tournament_overview.html', context)

@login_required
def gamestats(request, game_id):
	user_id = request.user.id
	friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
	stats = game_stats(request, game_id)
	data_stats = json.loads(stats.content)
	goals = game_goals(request, game_id)
	data_goals = json.loads(goals.content)
	game = json.loads(get_game(request, game_id).content)['data']
	context = {
		'friends': friends,
		'game': game,
		'game_id': game_id,
		'stats': data_stats,
		'goals': data_goals,
		'user_id': user_id
	}
	ic(context)
	return render(request,'pages/game_stats.html', context)

@login_required
def profile(request, id):
	user_id = request.user.id
	user_profile = get_object_or_404(Users, id=id)
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

	user = get_object_or_404(Users, id=id)
	tournaments = list_user_tournaments(id)
	stats_response = user_stats(request, user_profile.id)
	stats = json.loads(stats_response.content)
	if stats['nb_goals_suffered'] != 0:
		goals_scored_suffered_ratio = round(stats['nb_goals_scored'] / stats['nb_goals_suffered'], 2)
	else:
		goals_scored_suffered_ratio = 0
	graph = win_rate_nb_games_day(request, user_profile.id)
	graph_send = json.loads(graph.content)
	
	games = Games.objects.filter((Q(user1_id=user_profile.id) | Q(user2_id=user_profile.id))
		).exclude(duration=0).exclude(type="Tournament").order_by('-created_at')

	no_week_games = True
	if len(games) > 0:
		last_game_date = games.first().created_at
		today = datetime.today()
		monday = today - timedelta(days=today.weekday())
		monday = monday.astimezone(last_game_date.tzinfo)
		no_week_games = last_game_date.day < monday.day
	
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
		'tours': tournaments,
		'stats': stats,
		'no_week_games': no_week_games,
		'goals_scored_suffered_ratio': goals_scored_suffered_ratio,
		'graph': graph_send,
		'page': 'profile' if is_own_profile else 'else'
	}

	return render(request, 'pages/view_profile.html', context)


@login_required
def signout(request):
	user = Users.objects.get(pk=request.user.id)
	user.status = "Offline"
	user.save()
	response = JsonResponse({'message': 'Your account has been successfully logged out.'}, status=200)
	response.delete_cookie('refresh_token')
	logout(request)
	return response

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
			'type': "Tournament"
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
	tournament = Tournaments.objects.get(pk=tournament_id)
	tour_users = TournamentsUsers.objects \
		.filter(tournament_id=tournament_id) \
		.order_by('-score')

	for i, user in enumerate(tour_users):
		user.placement = i + 1
		user.save()

		user1 = user.user_id 
		user1.status = "Online"
		user1.save()
		user_stats = UserStats.objects.get(user_id=user1)
		if i == 0:
			user_stats.nb_tournaments_won += 1
		user_stats.nb_tournaments_played += 1
		user_stats.tournament_time_played += tournament.duration
		user_stats.save()
		ic(user_stats)

	
	tournament = Tournaments.objects.get(pk=tournament_id)
	tournament.winner_id = tour_users.first().user_id
	tournament.status ='Finished'
	tournament.save()
	serializer = TournamentsUsersSerializer(tour_users, many=True)
	return JsonResponse(serializer.data, status=200, safe=False)


def delete_profile(request, id):
	if request.method =='DELETE':
		Users.objects.filter(id=id).delete()
		return JsonResponse({'message': 'User deleted'}, status=200)
	return JsonResponse({'message': 'Invalid request method.', 'method': request.method}, status=405)