from django.shortcuts import render

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