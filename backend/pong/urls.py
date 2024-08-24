from django.urls import path, include, re_path
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LogoutView
from rest_framework.routers import DefaultRouter
from . import views

# Routers provide an easy way of automatically determining the URL conf.
#router = DefaultRouter()
#router.register('users', UsersViewSet)


urlpatterns =[
    path('', views.loginview, name="login"),
    path('home/', views.home, name="home"),
    path('tournaments/', views.tournaments, name="tournaments"),
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
    path('users/<int:pk>', views.user_detail, name='user-detail'),
    path('users/<str:username>', views.profile, name='user-profile'),
    path('users/create', views.user_create, name='user-create'),
    path('users/<int:pk>/update', views.user_update, name='user-update'),
    path('users/<int:pk>/password', views.user_password, name='user-update-password'),
    path('users/search', views.search_users, name='search-users'),
    path('users/search_suggestions', views.search_suggestions, name='search-suggestions'),
    path('friends/<int:user_id>', views.get_user_friends, name='friends-detail'),
    path('friends/<int:user1_id>/<int:user2_id>', views.add_remove_friend, name='friend-add-remove'),
    path('friends/accept/<int:user1_id>/<int:user2_id>', views.accept_friend, name='accept-friend'),
    path('notifications/<int:user_id>', views.get_user_notifications, name='notifications'),
    path('notifications/<int:user_id>/<int:notif_id>', views.delete_user_notification, name='delete-notification'),

	#! Games
    path('games/create', views.game_create, name='game-create'),
    #path('games/<int:game_id>/stats', views.game_stats, name='game-stats'),

	#! Tournaments
    path('tournaments/create', views.tournament_create, name='tournament-create'),
    path('tournaments/<int:tournament_id>', views.tournament_update, name='tournament-update'),
    path('tournaments/<int:tournament_id>/cancel', views.tournament_cancel, name='tournament-cancel'),

	#! Tournaments Users
    path('tournaments/<int:tournament_id>/users/<int:user_id>/join', views.tournament_join, name='tournament-join'),
    path('tournaments/<int:tournament_id>/users/<int:user_id>/leave', views.tournament_leave, name='tournament-leave'),
    path('tournaments/<int:tournament_id>/users', views.tournament_list_users, name='tournament-list-users'),

	#! Tournaments Games
    path('tournaments/<int:tournament_id>/games/create', views.tournament_create_game, name='tournament-create-game'),
    path('tournaments/<int:tournament_id>/games', views.tournament_list_games, name='tournament-list-games'),
    path('tournaments/games/user/<int:user_id>', views.tournament_list_user_games, name='tournament-list-user-games'),
    path('tournaments/<int:tournament_id>/games/<int:game_id>', views.tournament_update_game, name='tournament-update-game'),

] 