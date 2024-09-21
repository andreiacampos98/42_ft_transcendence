from django.urls import path, include, re_path
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LogoutView
from rest_framework.routers import DefaultRouter
from . import views
from . import consumers

# Routers provide an easy way of automatically determining the URL conf.
#router = DefaultRouter()
#router.register('users', UsersViewSet)


urlpatterns =[

    #! Pages
    path('', views.loginview, name="login"),
    path('home/', views.home, name="home"),
    path('gamelocal/', views.gamelocal, name="gamelocal"),
    path('gameonline/', views.gameonline, name="gameonline"),
    path('tournaments/', views.tournaments, name="tournaments"),
    path('tournaments/ongoing/<int:tournament_id>', views.ongoingtournaments, name="ongoingtournaments"),
    path('signup/', views.signup, name='signup'),
    path('signout/', views.signout, name="signout"),
    

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

    #! Users
    path('users/detail/<int:pk>', views.user_detail, name='user-detail'),
    path('users/<int:id>', views.profile, name='user-profile'),
    path('users/create', views.user_create, name='user-create'),
    path('users/delete/<int:id>', views.delete_profile, name='delete-profile'),
    path('users/<int:pk>/update', views.user_update, name='user-update'),
    path('users/<int:pk>/password', views.user_password, name='user-update-password'),
    path('users/search', views.search_users, name='search-users'),
    path('users/search_suggestions', views.search_suggestions, name='search-suggestions'),
    
    #! Friends
    path('friends/<int:user_id>', views.get_user_friends, name='friends-detail'),
    path('friends/<int:user1_id>/<int:user2_id>', views.add_remove_friend, name='friend-add-remove'),
    path('friends/accept/<int:user1_id>/<int:user2_id>', views.accept_friend, name='accept-friend'),
    
    #! Notifications
    path('notifications/<int:user_id>', views.get_user_notifications, name='notifications'),
    path('notifications/<int:user_id>/<int:notif_id>', views.delete_user_notification, name='delete-notification'),
    path('notifications/update/<int:notif_id>', views.update_notification, name='update-notification'),
    
    #! User Stats
    path('stats/<int:user_id>', views.user_stats, name='user-stats'),
    path('leaderboard', views.leaderboard, name='leaderboard'),
    path('currentplace/<int:user_id>', views.current_place, name='current-place'),

	#! Games
    path('games/create', views.game_create, name='game-create'),
    path('games/update/<int:game_id>', views.game_update, name='game-update'),
    
    #! Games Stats
    #path('games/<int:game_id>/stats', views.game_stats, name='game-stats'),

	#! Tournaments
    path('tournaments/create', views.tournament_create, name='tournament-create'),
    path('tournaments/<int:tournament_id>/users/<int:user_id>/join', views.tournament_join, name='tournament-join'),
    path('tournaments/<int:tournament_id>/users/<int:user_id>/leave', views.tournament_leave, name='tournament-leave'),
    path('tournaments/<int:tournament_id>', views.tournament_update, name='tournament-update'),
    path('tournaments/<int:tournament_id>/users', views.tournament_list_users, name='tournament-list-users'),
    # path('tournaments/<int:tournament_id>/advance', views.tournament_advance_phase, name='tournament-advance-phase'),
    path('tournaments/<int:tournament_id>/games', views.tournament_list_games, name='tournament-list-games'),
    path('tournaments/games/user/<int:user_id>', views.tournament_list_user_games, name='tournament-list-user-games'),
    path('tournaments/user/<int:user_id>', views.tournament_list_user, name='tournament-list-user'),
    path('tournaments/<int:tournament_id>/games/<int:game_id>', views.tournament_update_game, name='tournament-update-game'),

    #! Oauth2.0
    path('userinfo', views.get_user_info, name='user-info'),
    path('signin42', views.signin42, name='signin42'),
    path('home42/', views.login42, name='login42'),
    
    #! DEBUG
    path('tournaments', views.tournament_list, name='tournament-list'),
    
] 

websocket_urlpatterns = [
    path('ws/tournaments/<int:tournament_id>', consumers.TournamentConsumer.as_asgi()),
]