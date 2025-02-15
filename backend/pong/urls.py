from django.urls import path, include, re_path
from rest_framework_simplejwt import views as jwt_views
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LogoutView
from rest_framework.routers import DefaultRouter
from . import views
from .consumers.Tournament import TournamentConsumer
from .consumers.RemoteGame import RemoteGameQueueConsumer
from .consumers.TournamentGame import TournamentGameConsumer


urlpatterns = [

    #! Pages
    path('', views.loginview, name="login"),
    path('verifyemail/', views.verifyemail, name="email"),
    path('verifyemail/resendcode', views.send_code_verify_email, name='resend-code'),
    path('otp/', views.otp_view, name='otp'),
    path('home/', views.home, name="home"),
    path('gamelocal/', views.gamelocal, name="gamelocal"),
    path('gameonline/', views.gameonline, name="gameonline"),
    path('gameai/', views.gameai, name="gameai"),
    path('gametournament/', views.gametournament, name="gametournament"),

    path('tournaments/', views.tournaments, name="tournaments"),
    path('tournaments/ongoing/<int:tournament_id>', views.ongoingtournaments, name="ongoingtournaments"),
    path('signup/', views.signup, name='signup'),
    path('signout/', views.signout, name="signout"),
    path('games/<int:game_id>/stats', views.gamestats, name="game-stats"),
    path('tournaments/<int:tournament_id>/stats', views.tournamentstats, name="tournament-stats"),

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
    path('friends/decline/<int:user1_id>/<int:user2_id>', views.decline_friend, name='decline-friend'),
    
    #! Notifications
    path('notifications/<int:user_id>', views.get_user_notifications, name='notifications'),
    path('notifications/<int:user_id>/<int:notif_id>', views.delete_user_notification, name='delete-notification'),
    path('notifications/update/<int:notif_id>', views.update_notification, name='update-notification'),
    
    #! User Stats
    path('stats/<int:user_id>', views.user_stats, name='user-stats'),
    path('leaderboard', views.leaderboard, name='leaderboard'),
    path('currentplace/<int:user_id>', views.current_place, name='current-place'),
    path('graph/<int:user_id>', views.win_rate_nb_games_day, name='win-rate-nb-games'),
    path('stats/users', views.user_stats_all, name='user-stats-all'),

	#! Games
    path('games/create', views.game_create, name='game-create'),
    path('games/update/<int:game_id>', views.game_update, name='game-update'),
    
    #! Goals
    path('games/<int:game_id>/goals', views.game_goals, name='game-goals'),

	#! Tournaments
    path('tournaments/create', views.tournament_create, name='tournament-create'),
    path('tournaments/<int:tournament_id>/users/<int:user_id>/join', views.tournament_join, name='tournament-join'),
    path('tournaments/<int:tournament_id>', views.tournament_update, name='tournament-update'),
    path('tournaments/<int:tournament_id>/users', views.tournament_list_users, name='tournament-list-users'),
    path('tournaments/<int:tournament_id>/games', views.tournament_list_games, name='tournament-list-games'),
    path('tournaments/games/user/<int:user_id>', views.tournament_list_user_games, name='tournament-list-user-games'),
    path('tournaments/user/<int:user_id>', views.tournament_list_user, name='tournament-list-user'),
    path('tournaments/<int:tournament_id>/games/<int:game_id>', views.tournament_update_game, name='tournament-update-game'),

    #! Oauth2.0
    path('userinfo', views.get_user_info, name='user-info'),
    path('signin42/', views.signin42, name='signin42'),
    path('home42/', views.login42, name='login42'),

    #! 2FA
    path('toggle-2fa/<int:user_id>', views.toggle2fa, name='toggle-2fa'),
    path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/verify/', jwt_views.TokenVerifyView.as_view(), name='token_verify'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/blacklist/', jwt_views.TokenBlacklistView.as_view(), name='token_blacklist'), 
    path('checktoken/', views.check_token, name='check_token'),
    path('2fa/resendcode/', views.send_otp, name='resende-code-2fa'),
    #! Debug
    path('tournaments', views.tournament_list, name='tournament-list'),
    path('debug/games/<int:game_id>', views.get_game, name='debug-get-game'),
    path('debug/games/goals', views.game_goals_all, name='game-goals-all'),
    path('debug/games/<int:game_id>/stats', views.game_stats, name='debug-game-stats'),
    path('debug/games/stats', views.game_stats_all, name='debug-game-stats-all'),
    path('tournaments/<int:tournament_id>/users/<int:user_id>/leave', views.tournament_leave_1, name='tournament-leave'),
] 

websocket_urlpatterns = [
    path('wss/tournaments/<int:tournament_id>', TournamentConsumer.as_asgi()),
    path('wss/tournaments/<int:tournament_id>/games/<int:game_id>', TournamentGameConsumer.as_asgi()),
    path('wss/games/remote/queue', RemoteGameQueueConsumer.as_asgi()),
]