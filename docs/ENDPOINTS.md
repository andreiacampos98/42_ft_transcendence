# Endpoints

## Users

| Route | HTTP Method | Description | Parameters | View | URL - Name |
| --- | :--: | --- | --- | --- | --- |
| `users/<str:username>` | `GET` | Retrieve user | `username` - the user's username | profile | 'users/<str:username>' - user-profile |
| `users/{id}` | `GET` | Retrieve user | `id` - the user's id | user_detail | 'users/<int:pk>' - user-detail |
| `users/create` | `POST` | Create user | | user_create | 'users/create' -  user-create |
| `users/{id}/update`| `PUT`  `PATCH` | Update user | `id` - the user's id | user_update | 'users/<int:pk>/update' - user-update |
| `users/{id}/password` | `PUT` | Update user's password | `id` - the user's id| user_password | 'users/<int:pk>/password' - user-update-password |
| `users/search` | `GET` | List users that match a given prefix | `searched` - a prefix to be matched with all available usernames | search_users | 'users/search' - search-users
| `users/search_suggestions` | `GET` | List users that match a given prefix while the user is typing | `term` - a prefix | search_suggestions |  'users/search_suggestions' - search-suggestions
| ` `| `POST` | Login user | | loginview | ' ' - login
| `users/auth` | `POST` | Login user with 42 | |

## Games

| Route | HTTP Method | Description | Parameters | Name |
| --- | :--: | --- | --- | --- |
| `/games/create` | `POST` | Post a new game |  | `game-create` |
| `/games/{id}/stats` | `GET` | Retrieve statistics for a given game | `id` - the game's id | `???` |

## Tournaments

| Route | HTTP Method | Description | Parameters |
| --- | :--: | --- | --- |
| `/tournaments/create`| `POST` | Create tournament | |
| `/tournaments/{tid}/users/{uid}/join`| `POST` | Join a tournament | `tid` - the tournament's id, `uid` - the user's id |
| `/tournaments/{tid}/users/{uid}/leave` | `DELETE` | Leave a tournament | `id` - the tournament's id, `uid` - the user who's leaving the tournament |
| `/tournaments/{id}` | `PATCH` | Update tournament (status only) | `id` - the tournament's id |
| `/tournaments/{id}/users` | `GET` | List all tournament users (alias) for a given tournament | `id` - the tournament's id |

| `/tournaments/{id}/games`| `GET` | List all games for a given tournament | `id` - the tournament's id  |
| `/tournaments/games/user/{id}` | `GET` | List all tournament games for a given user | `id` - the user's id |
| `tournaments/<int:tournament_id>/games/<int:game_id>`|  `POST` | Update game if finished, create the games for the next phase and placement | `<int:tournament_id>` - the tournament's id `<int:game_id>` |
| `/tournaments`| `GET` | List of tournament | |


## Friends

| Route | HTTP Method | Description | Parameters | View | URL - Name |
| --- | :--: | --- | --- |--- | --- |
| `friends/{uid1}/{uid2}` | `POST` | Add a new friend request. Sends a notification to the other user. | `uid1` - the first user, `uid2` - the second user | add_remove_friend | 'friends/<int:user1_id>/<int:user2_id>' - friend-add-remove
| `friends/{uid1}/{uid2}` | `DELETE` | Delete a friend / Deny a friend request | `uid1` - the first user, `uid2` - the second user | add_remove_friend | 'friends/<int:user1_id>/<int:user2_id>' - friend-add-remove
| `friends/{id}` | `GET` | Retrieve all user's friends | `id` - the  user's id to get the friends from | get_user_friends | 'friends/<int:user_id>' - friends-detail | get_user_friends | 'friends/<int:user_id>' - friends-detail
| `friends/accept/{uid1}/{uid2}` | `POST` | Accept a friend request. Sends a notification to the other user. | `uid1` - the first user, `uid2` - the second user | accept_friend | 'friends/accept/<int:user1_id>/<int:user2_id>' - accept-friend |


## Notifications

| Route | HTTP Method | Description | Parameters | View | URL - Name |
| --- | :--: | --- | --- | --- | --- |
| `notifications/<int:user_id>` | `GET` | List all notifications for a given user | `id` - the user's id | get_user_notifications | 'notifications/<int:user_id>' - notifications |
| `notifications/<int:user_id>/<int:notif_id>`| `DELETE` | Delete user notification | `id` - the user's id | get_user_notifications | 'notifications/<int:user_id>' - notifications |
| `notifications/update/<int:notif_id>`| `PATCH` | Update the status of the notification | `notif_id` - the notifications's id | update_notification | 'notifications/update/<int:notif_id>' - update-notification |