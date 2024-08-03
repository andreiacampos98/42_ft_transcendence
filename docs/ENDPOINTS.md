# Endpoints

## Users

| Route | HTTP Method | Description | Parameters | View | URL - Name |
| --- | :--: | --- | --- | --- | --- |
| `/users/create` | `POST` | Create user | | user_create | 'users/create' -  user-create
| `/users/{id}` | `GET` | Retrieve user | `id` - the user's id |
| `/users/{id}/update`| `PUT` | Update user | `id` - the user's id |
| `/users/login`| `POST` | Login user | |
| `/users/auth` | `POST` | Login user with 42 | |
| `/users/{prefix}` | `GET` | List/Search users that match a given prefix | `prefix` - a prefix to be matched with all available usernames | 
| `/users/{id}/password` | `PUT` | Update user's password | `id` - the user's id|

## Games

| Route | HTTP Method | Description | Parameters |
| --- | :--: | --- | --- |
| `/games/create` | `POST` | Post a new game (started or ended ?)| |
| `/games/{id}/stats` | `GET` | Retrieve statistics for a given game  | `id` - the game's id |

## Tournaments

| Route | HTTP Method | Description | Parameters |
| --- | :--: | --- | --- |
| `/tournaments/create`| `POST` | Create tournament | |
| `/tournaments/{id}` | `PUT` | Update tournament | `id` - the tournament's id |
| `/tournaments/{id}` | `DELETE` | Delete tournament | `id` - the tournament's id |
| `/tournaments/leave/{id}/{uid}` | `DELETE` | Leave a tournament | `id` - the tournament's id, `uid` - the user who's leaving the tournament |

## Tournaments Games

| Route | HTTP Method | Description | Parameters |
| --- | :--: | --- | --- |
| `/tournaments/{id}/games/create` | `POST` | Create a game for a given tournament | `id` - the tournament's id |
| `/tournaments/{id}/games`| `GET` | List all games for a given tournament | `id` - the tournament's id  |
| `/tournaments/games/user/{id}` | `GET` | List all tournament games for a given user | `id` - the user's id |

## Tournaments Users

| Route | HTTP Method | Description | Parameters |
| --- | :--: | --- | --- |
| `/tournaments/{id}/user` | `GET` | List all tournament users (alias) for a given tournament | `id` - the tournament's id |
| `/tournaments/{tid}/user/{uid}`| `POST` | Create new tournament user (alias) | `tid` - the tournament's id, `uid` - the user's id |


## Friends

| Route | HTTP Method | Description | Parameters | View | URL - Name |
| --- | :--: | --- | --- |--- | --- |
| `/friends/{uid1}/{uid2}` | `POST` | Add a new friend request. Sends a notification to the other user. | `uid1` - the first user, `uid2` - the second user |
| `/friends/{uid1}/{uid2}` | `DELETE` | Delete a friend / Deny a friend request | `uid1` - the first user, `uid2` - the second user |
| `/friends/{id}` | `GET` | Retrieve all user's friends | `id` - the  user's id to get the friends from | get_user_friends | 'friends/<int:user_id>' - friends-detail |
| `/friends/accept/{uid1}/{uid2}` | `POST` | Accept a friend request. Sends a notification to the other user. | `uid1` - the first user, `uid2` - the second user |


## Notifications

| Route | HTTP Method | Description | Parameters |
| --- | :--: | --- | --- |
| `/notifications/user/{id}` | `GET` | List all notifications for a given user | `id` - the user's id |
| `/notifications/user/{id}`| `DELETE` | Delete user notification | `id` - the user's id |