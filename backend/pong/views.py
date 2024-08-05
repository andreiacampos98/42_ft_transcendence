from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from django.contrib.auth.hashers import make_password 
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required


import json
from icecream import ic
from .models import Users


# Since we want to create an API endpoint for reading, creating, and updating 
# Company objects, we can use Django Rest Framework mixins for such actions.
from rest_framework import status

from django.db.models import Q
from django.http import JsonResponse
from .models import Users, Friends, Notifications
from .serializers import UsersSerializer, FriendsSerializer, NotificationsSerializer


#---------------------------------------Users--------------------------

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


@csrf_exempt
def search_users(request):
    if request.method == "GET":
        term = request.GET.get('searched', '')
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            if len(term) > 2:  # Only search if term is longer than 2 characters
                users = Users.objects.filter(username__icontains=term).values('username', 'picture', 'status')
                return JsonResponse(list(users), safe=False)
            else:
                return JsonResponse([], safe=False)  # Return an empty list for short terms
        else:
            userss = Users.objects.filter(username__icontains=term)
            return render(request, 'pages/search_users.html', {'searched': term, 'userss': userss})
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

#---------------------------Friends----------------------------------

#friends displayed in he side bar right
def get_user_friends(request, user_id):
    if request.method == "GET":
        friends = Friends.objects.filter(
            (Q(user1_id=user_id) | Q(user2_id=user_id)) & Q(accepted=True)
        )
        serializer = FriendsSerializer(friends, many=True)
    return JsonResponse(serializer.data, safe=False)



@csrf_exempt
def add_remove_friend(request, user1_id, user2_id):
    if request.method == "POST":
        # Check if user is trying to add themselves as a friend
        if user1_id == user2_id:
            return JsonResponse({"error": "Users cannot be friends with themselves."}, status=400)

        # Check if the friendship already exists
        if Friends.objects.filter(user1_id=user1_id, user2_id=user2_id).exists() or \
           Friends.objects.filter(user1_id=user2_id, user2_id=user1_id).exists():
            return JsonResponse({"error": "Friendship already exists."}, status=400)

        # Get the user objects
        user1 = get_object_or_404(Users, id=user1_id)
        user2 = get_object_or_404(Users, id=user2_id)

        # Create the friendship request
        friend = Friends.objects.create(user1_id=user1, user2_id=user2, accepted=False)
        notification = Notifications.objects.create(type="Friend Request", status="Pending", description=" has request to be your friend.", user_id = user2, other_user_id = user1)
        notification.save()
        response_data = {
            "message": "Friendship request sent successfully.",
            "user1": user1.username,
            "user2": user2.username,
            "accepted": friend.accepted
        }
        return JsonResponse(response_data, status=201)

    elif request.method == "DELETE":
        # Check if the friendship exists
        friendship = Friends.objects.filter(
            (Q(user1_id=user1_id, user2_id=user2_id) | Q(user1_id=user2_id, user2_id=user1_id))
        ).first()

        if not friendship:
            return JsonResponse({"error": "Friendship does not exist."}, status=404)

        # Delete the friendship
        friendship.delete()

        response_data = {
            "message": "Friendship deleted successfully."
        }
        return JsonResponse(response_data, status=204)
    # Handle methods other than POST
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def accept_friend(request, user1_id, user2_id):
    if request.method == "PATCH":
        friendship = Friends.objects.filter(
            (Q(user1_id=user1_id, user2_id=user2_id) | Q(user1_id=user2_id, user2_id=user1_id))
        ).first()

        if not friendship:
            return JsonResponse({"error": "Friendship does not exist."}, status=404)
        
        if friendship.accepted:
            return JsonResponse({"error": "Friendship request has already been accepted."}, status=400)
        
        friendship.accepted = True
        friendship.save()
        user1 = get_object_or_404(Users, id=user1_id)
        user2 = get_object_or_404(Users, id=user2_id)
        notification = Notifications.objects.create(type="Accepted Friend Request", status="Pending", description=" has accepted your friend request!", user_id = user2, other_user_id = user1)
        notification.save()
        response_data = {
            "message": "User accept the request."
        }
        return JsonResponse(response_data, status=200)
    return JsonResponse({"error": "Method not allowed"}, status=405)

#--------------------------- Notifications ----------------------------------

def get_user_notifications(request, user_id):
    if request.method == "GET":
        notifications = Notifications.objects.filter(user_id = user_id)
        serializer = NotificationsSerializer(notifications, many=True)
        return JsonResponse(serializer.data, safe=False)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def delete_user_notification(request, user_id, notif_id):
    if request.method == "DELETE":
        notifications = Notifications.objects.filter(Q(user_id = user_id) & Q( id = notif_id))
        notifications.delete()
        response_data = {
            "message": "Notification deleted."
        }
        return JsonResponse(response_data, status=204)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def update_notification(request, notif_id):
    if request.method == "PATCH":
        notifications = Notifications.objects.get(id = notif_id)
        notifications.status = "Read"
        notifications.save()
        response_data = {
            "message": "Status of notification updated."
        }
        return JsonResponse(response_data, status=204)
    return JsonResponse({"error": "Method not allowed"}, status=405)

# ----------------------------- Pages ---------------------------------------

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
def profile(request, username):

    user_id = request.user.id  # Obtém o ID do usuário atual
    user_profile = get_object_or_404(Users, username=username)
    is_own_profile = user_profile == request.user
    # Obtém a lista de amigos
    friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
    user = get_object_or_404(Users, username=username)
    context = {
        'friends': friends,
        'user_id': user_id,
        'user': user,
        'is_own_profile': is_own_profile,
    }
    return render(request, 'pages/view_profile.html', context)


@login_required
def signout(request):
    logout(request)
    return redirect('home')