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
    path('profile/<str:username>', views.profile, name='user_profile'),
    #re_path('^', include(router.urls)),


    path('users/<int:pk>', views.user_detail, name='user-detail'),
    path('users/create', views.user_create, name='user-create'),
    path('users/<int:pk>/update', views.user_update, name='user-update'),
    path('users/<int:pk>/password', views.user_password, name='user-update-password'),
    path('users/search', views.search_users, name='search-users'),
    path('users/search_suggestions', views.search_suggestions, name='search-suggestions'),
#     path('users/search/<str:value>', views.search_users, name='search-users-with-value'),

    path('friends/<int:user_id>', views.get_user_friends, name='friends-detail'),
    path('friends/<int:user1_id>/<int:user2_id>', views.add_remove_friend, name='friend-add-remove'),
    path('friends/accept/<int:user1_id>/<int:user2_id>', views.accept_friend, name='accept-friend'),

    path('notifications/<int:user_id>', views.get_user_notifications, name='notifications'),
    path('notifications/<int:user_id>/<int:notif_id>', views.delete_user_notification, name='delete-notification'),
    path('notifications/update/<int:notif_id>', views.update_notification, name='update-notification'),
] 