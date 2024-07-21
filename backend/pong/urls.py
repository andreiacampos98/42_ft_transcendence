from django.urls import path, include, re_path
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LogoutView
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
    path('', views.loginview, name="login"),
    path('home/', views.home, name="home"),
    path('tournaments/', views.tournaments, name="tournaments"),
    path('profile/', views.profile, name="profile"),
    path('signup/', views.signup, name='signup'),
    path('password_reset/', auth_views.LoginView.as_view(template_name='pages/password_reset.html'), name='password_reset'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),
    #re_path('^', include(router.urls)),
    path('api/users/', UserListView.as_view(), name='user-list'),
    path('api/users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('register/', UserCreateView.as_view(), name='user-create'),
    path('api/users/<int:pk>/update', UserUpdateView.as_view(), name='user-update'),
] 