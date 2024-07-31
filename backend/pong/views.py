from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response
#from django.contrib.auth.models import User

from icecream import ic
from .models import Users

from .serializers import UsersSerializer

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
from .serializers import UsersSerializer, FriendsSerializer



# ViewSets define the view behavior.
class UserListView(generics.ListAPIView):
    serializer_class = UsersSerializer
    queryset = Users.objects.all()

class UserDetailView(generics.RetrieveAPIView):
    queryset = Users.objects.all()
    serializer_class = UsersSerializer

class UserCreateView(CreateModelMixin, generics.GenericAPIView):
    queryset = Users.objects.all()
    serializer_class = UsersSerializer

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

class UserUpdateView(UpdateModelMixin, generics.GenericAPIView):
    queryset = Users.objects.all()
    serializer_class = UsersSerializer

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

class FriendsListView(generics.ListAPIView):
    serializer_class = FriendsSerializer
    queryset = Friends.objects.all()


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

        myuser = Users.objects.create_user(username=username, password1=password1)
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

#when the user click in the search
def search_users(request):
    if request.method == "POST":
        searched = request.POST.get('searched')
        userss = Users.objects.filter(username__icontains=searched)
        return render (request, 'pages/search_players.html', {'searched':searched, 'userss':userss})

#when the user type in the search
def suggest_users(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            term = request.GET.get('term', '')
            users = Users.objects.filter(username__icontains=term).values('username')
            return JsonResponse(list(users), safe=False)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)

def get_user_friends(request, user_id):
    if request.method == "GET":
        friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
        return JsonResponse(list(friends), safe=False)

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
def signout(request):
    logout(request)
    return redirect('home')

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