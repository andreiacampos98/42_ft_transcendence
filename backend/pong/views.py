from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.parsers import JSONParser, MultiPartParser
from django.contrib.auth.hashers import make_password 
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response
from rest_framework.decorators import api_view
#from django.contrib.auth.models import User
import json
from icecream import ic
from .models import Users

from .serializers import UsersSerializer, FriendsSerializer

# Since we want to create an API endpoint for reading, creating, and updating 
# Company objects, we can use Django Rest Framework mixins for such actions.
from rest_framework import generics, status
from rest_framework.mixins import (
    CreateModelMixin,   #POST
    RetrieveModelMixin, #GET 
    UpdateModelMixin,   #PUT
    DestroyModelMixin,  #DELETE
    ListModelMixin,     # add a list method to list several
)
from rest_framework.viewsets import GenericViewSet
from django.db.models import Q
from django.http import JsonResponse
from .models import Users, Friends
from .serializers import UsersSerializer


def user_detail(request, pk):
    if request.method == "GET":
        user = get_object_or_404(Users, pk=pk)
        serializer = UsersSerializer(user)
        return JsonResponse(serializer.data, safe=False)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
@require_POST
def user_create(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        serializer = UsersSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except KeyError as e:
        return JsonResponse({'error': f'Missing key: {str(e)}'}, status=400)

@csrf_exempt
def user_update(request, pk):
    if request.method in ['PUT', 'PATCH']:
        user = get_object_or_404(Users, pk=pk)

        if request.content_type == 'application/json':
            data = json.loads(request.body.decode('utf-8'))
        else:
                # Merge request.POST and request.FILES for form-data handling
            data = request.POST.copy()
            data.update(request.FILES)

        serializer = UsersSerializer(user, data=data, partial=(request.method == 'PATCH'))

        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, safe=False)
        return JsonResponse(serializer.errors, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def user_password(request, pk):
    if request.method =='POST':
        user = get_object_or_404(Users, pk=pk)
        new_password1 = request.POST.get('password1')
        new_password2 = request.POST.get('password2')

        if not new_password1:
            return JsonResponse({'error': 'Password is required'}, status=400)

        if new_password1 != new_password2:
            return JsonResponse({'error': 'Passwords did not match.'}, status=400)
        
        user.password = make_password(new_password1)
        user.save()

        return JsonResponse({'message': 'Password updated successfully'}, status=200)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

# #when the user click in the search
@csrf_exempt
def search_users(request, value):
    if request.method == "GET":
        userss = Users.objects.filter(username__icontains=value)
        serializer = UsersSerializer(userss, many=True)  # Set many=True for querysets
        return JsonResponse(serializer.data, safe=False)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

#when the user type in the search
def suggest_users(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            term = request.GET.get('term', '')
            users = Users.objects.filter(username__icontains=term).values('username')
            return JsonResponse(list(users), safe=False)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)


#---------------------------Friends----------------------------------

#friends displayed in he side bar right
def get_user_friends(request, user_id):
    if request.method == "GET":
        friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
        serializer = FriendsSerializer(friends, many=True)
    return JsonResponse(serializer.data, safe=False)



@login_required
def add_friend(request, user1_id, user2_id):
	if request.method == "POST":
		if user1_id == user2_id:
			return Response({"error": "Users cannot be friends with themselves."}, status=status.HTTP_400_BAD_REQUEST)		

		if Friends.objects.filter(user1_id=user1_id, user2_id=user2_id).exists() or Friends.objects.filter(user1_id=user2_id, user2_id=user1_id).exists():
			return Response({"error": "Friendship already exists."}, status=status.HTTP_400_BAD_REQUEST)

		user1 = Users.objects.get(id=user1_id)
		user2 = Users.objects.get(id=user2_id)
		friend = Friends.objects.create(user1_id=user1, user2_id=user2)
		friend.save()

		return redirect('UserViewProfile', user1.username)



# ------------------------------------------

def signup(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password1 = request.POST.get('password')
        password2 = request.POST.get('reconfirm')

        if Users.objects.filter(username=username).exists():
            messages.error(request, "Username already exists! Please try another username.")
            return redirect('signup')

        if password1 != password2:
            messages.error(request, "Passwords didn't match.")
            return redirect('signup')

        if not username.isalnum():
            messages.error(request, "Username must be alphanumeric.")
            return redirect('signup')

        myuser = Users.objects.create_user(username=username, password=password1)
        myuser.save()

        messages.success(request, "Your account has been successfully created.")
        return redirect('login')

    return render(request, 'pages/sign-up.html')

def loginview(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, "Bad Credentials")
            return redirect('login')

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
        'user_id': user_id
    }
    return render(request, 'pages/home-view.html', context)


@login_required
def tournaments(request):
    user_id = request.user.id  # Obtém o ID do usuário atual

    # Obtém a lista de amigos
    friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
    context = {
        'friends': friends,
        'user_id': user_id
    }
    return render(request,"pages/tournaments.html", context)

@login_required
def profile(request):
    user_id = request.user.id  # Obtém o ID do usuário atual

    # Obtém a lista de amigos
    friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
    context = {
        'friends': friends,
        'user_id': user_id
    }
    return render(request,'pages/profile.html', context)

@login_required
def UserViewProfile(request, username):

    user_id = request.user.id  # Obtém o ID do usuário atual

    # Obtém a lista de amigos
    friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
    user = get_object_or_404(Users, username=username)
    context = {
        'friends': friends,
        'user_id': user_id,
        'user': user
    }
    return render(request, 'pages/view_profile.html', context)

@login_required
def signout(request):
    logout(request)
    return redirect('home')