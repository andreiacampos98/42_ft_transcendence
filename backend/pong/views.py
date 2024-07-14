from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.forms import AuthenticationForm
from icecream import ic
from .models import Users

from .forms import (
    UserRegisterForm,
    UserUpdateForm
)
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


def base(request):
    """
    BASE PARA TEMPLATES
    """
    return render(request, 'pages/home-view.html')

def index(request):
    """
    Não necessita de uma verificação do tipo de requisição,
    pois retornaremos apenas um layout
    """
    return render(request,"website/navs.html")
    
    
def about(request):
    """
    Não necessita de uma verificação do tipo de requisição,
    pois retornaremos apenas um layout
    """
    return render(request,"website/pages/sign-up.html")
    
def contact(request):
    """
    Não necessita de uma verificação do tipo de requisição,
    pois retornaremos apenas um layout,neste caso para enviar
    um formulário, deve-se criar outra view com um template próprio
    para seu formulário.
    """
    return render(request,"website/pages/home-view.html")

def loginview(request):
    # print(request.POST.get('username'), request.POST.get('password'))
    ic(request.POST)
    if request.method == 'POST':
        form = AuthenticationForm(request, request.POST)
        ic(form.is_valid())
        if form.is_valid():
            username = request.POST.get('username')
            password = request.POST.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                # Redirect to a success page (optional
                print('YES')
                return render(status=200, request=request, template_name='pages/home-view.html')  # Replace 'success_url' with your URL name or path
            else:
                print('NO')
                # Return an 'invalid login' error message (optional)
                return render(status=404, request=request, template_name='pages/login.html', context={'error': 'Invalid username or password'})
    return render(request, 'pages/login.html')
    

def signup(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Your account has been created! You are now able to Log in')
            return redirect('pages/login.html')
    else:
        form = UserRegisterForm()
    return render(request, 'pages/sign-up.html', {'form': form})