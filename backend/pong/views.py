from django.shortcuts import render

from .models import Users
from .serializers import UsersSerializer

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


class UsersViewSet(GenericViewSet,  # generic view functionality
    CreateModelMixin,               # handles POSTs
    RetrieveModelMixin,             # handles GETs for 1 Users
    UpdateModelMixin,               # handles PUTs and PATCHes
    ListModelMixin):                # handles GETs for many Companies

      serializer_class = UsersSerializer
      queryset = Users.objects.all()




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