from django.urls import path, include, re_path
from django.contrib.auth import views as auth_views
from rest_framework.routers import DefaultRouter
from . import views
from .views import ( 
    UserListView, 
    UserCreateView, 
    UserUpdateView,
    UserDetailView
)

# Routers provide an easy way of automatically determining the URL conf.
#router = DefaultRouter()
#router.register('users', UsersViewSet)


urlpatterns =[
    path('', auth_views.LoginView.as_view(template_name='pages/login.html'), name='login'),
    path('home/', views.base, name="home"),
    path('signup/', views.signup, name='signup'),
    path('password_reset/', auth_views.LoginView.as_view(template_name='pages/password_reset.html'), name='password_reset'),
    #re_path('^', include(router.urls)),
    path('api/users/', UserListView.as_view(), name='user-list'),
    path('api/users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('register/', UserCreateView.as_view(), name='user-create'),
    path('api/users/<int:pk>/update', UserUpdateView.as_view(), name='user-update'),
    #path('login/', views.loginview, name="login"),
    path('index/', views.index, name="index"),
    path('about/', views.about, name="about"),
    path('contact/', views.contact, name="contact"),
]