from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
#from django.contrib.auth.models import User

from icecream import ic
from .models import Users

from .serializers import UsersSerializer

# Since we want to create an API endpoint for reading, creating, and updating 
# Company objects, we can use Django Rest Framework mixins for such actions.
from rest_framework import generics
from rest_framework.mixins import (
    CreateModelMixin,   #POST
    RetrieveModelMixin, #GET 
    UpdateModelMixin,   #PUT
    DestroyModelMixin,  #DELETE
    ListModelMixin,     # add a list method to list several
)
from rest_framework.viewsets import GenericViewSet

from .models import Users
from .serializers import UsersSerializer


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

@login_required
def home(request):
    return render(request, 'pages/home-view.html')

@login_required
def signout(request):
    logout(request)
    return redirect('home')

@login_required
def tournaments(request):
    return render(request,"pages/tournaments.html")

@login_required
def profile(request):
    return render(request,'pages/profile.html', {'user': request.user})