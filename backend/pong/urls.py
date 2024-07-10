from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from . import views
from .views import UsersViewSet


router = DefaultRouter()
router.register('users', UsersViewSet)


urlpatterns =[
    path('', views.base, name="base"),
    path('index/', views.index, name="index"),
    path('about/', views.about, name="about"),
    path('contact/', views.contact, name="contact"),
    re_path('^', include(router.urls)),
]