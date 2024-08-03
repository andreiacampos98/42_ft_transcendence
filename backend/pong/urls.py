from django.urls import path, include, re_path
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LogoutView
from rest_framework.routers import DefaultRouter
from . import views
from .views import ( 
    UserListView, 
    UserUpdateView,
    UserDetailView,
    UserViewProfile
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
    path('password-reset/', 
            auth_views.PasswordResetView.as_view(template_name='pages/password_reset.html'), 
            name='password_reset'),
    path('password-reset/done', 
            auth_views.PasswordResetDoneView.as_view(template_name='pages/password_reset_done.html'), 
            name='password_reset_done'),
    path('password-reset-confirm/<uidb64>/<token>', 
            auth_views.PasswordResetConfirmView.as_view(template_name='pages/password_reset_confirm.html'), 
            name='password_reset_confirm'),
    path('password-reset-complete', 
            auth_views.PasswordResetCompleteView.as_view(template_name='pages/password_reset_complete.html'), 
            name='password_reset_complete'),
    #path('password_reset/', views.resetpassword, name='password_reset'),
    #path('reset_code/', views.resetcode, name='reset_code'),
    #path('set_new_password/', views.setnewpassword, name='set_new_password'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),
    path('profile/<str:username>/', views.UserViewProfile, name='user_profile'),
    #re_path('^', include(router.urls)),

    path('users', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>', UserDetailView.as_view(), name='user-detail'),
    path('users/create', views.user_create, name='user-create'),
    path('users/<int:pk>/update', UserUpdateView.as_view(), name='user-update'),
    #path('users/<int:pk>/password', UserPasswordView.as_view(), name='user-update'),



    path('search_players/', views.search_users, name='search-players'),
    path('suggest_users/', views.suggest_users, name='suggest_users'),
    path('friends/<int:user_id>', views.get_user_friends, name='friends-detail'),
    path('friends/<int:user1_id>/<int:user2_id>', views.add_friend, name='friend-add'),
#     path('api/friends/<int:user_id>/', FriendDetailView.as_view(), name='friend-detail'),

] 