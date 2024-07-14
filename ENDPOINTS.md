# Endpoints

## Users

| Route | HTTP Method | Description | Parameters |
| --- | :--: | --- | --- |
| `/users/create` | `POST` | Create user | |
| `/users/{id}` | `GET` | Retrieve user | `id` - the user's id |
| `/users/{id}`| `PUT` | Update user | `id` - the user's id |
| `/users/login`| `POST` | Login user | |
| `/users/auth` | `POST` | Authenticate with 42 | |
| `/users/{id}/password` | `PUT` | Update user's password | `id` - the user's id|
| `/users/{prefix}` | `GET` | List all users that match a given prefix | `prefix` - a prefix to be matched with all available usernames | 

## Games

> [!IMPORTANT]
> - Deleted: retrieve a game for a given user

> [!WARNING]
> - Replaced: retrieve statistics for a given user's game
> - With: retrieve statistics for a given game

| Route | HTTP Method | Description | Parameters |
| --- | :--: | --- | --- |
| `/games/create` | `POST` | Create a game | |
| `/games/{id}/stats` | `GET` | Retrieve statistics for a given game  | `id` - the game's id |
| `/games/user/{id}` | `GET` | List all games for a given user | `id` - the user's id |

## Tournaments

> [!WARNING]
> - Replaced: retrieve a tournament
> - With: list all tournaments

| Route | HTTP Method | Description | Parameters |
| --- | :--: | --- | --- |
| `/tournaments` | `GET` | List all tournaments | |
| `/tournaments/create`| `POST` | Create tournament | |
| `/tournaments/{id}` | `PUT` | Update tournament | `id` - the tournament's id |
| `/tournaments/{id}` | `DELETE` | Delete tournament | `id` - the tournament's id |

## Tournaments Games

> [!WARNING]
> - Replaced: retrieve a game for a given tournament
> - with: list all games for a given tournament

> [!IMPORTANT]
> - Added: list all tournament games for a given user

| Route | HTTP Method | Description | Parameters |
| --- | :--: | --- | --- |
| `/tournaments/games/create` | `POST` | Create tournament game | |
| `/tournaments/games/user/{id}` | `GET` | List all tournament games for a given user | |
| `/tournaments/{tid}/games`| `GET` | List all games for a given tournament | `tid` - the tournament's id  |
| `/tournaments/{tid}/games/{gid}`| `DELETE` | Delete tournament game |`tid` - the tournament's id, `gid` - the game's id |

## Friends

> [!WARNING]
> - Replaced: get a friend for a given user
> - With: list all friends for a given user

| Route | HTTP Method | Description | Parameters |
| --- | :--: | --- | --- |
| `/friends/{uid1}/add/{uid2}` | `POST` | Add a new friend to a given user | `uid1` - the first user, `uid2` - the second user |
| `/friends/{uid1}/add/{uid2}` | `DELETE` | Delete a friend from a given user  | `uid1` - the first user, `uid2` - the second user |
| `/friends/{id}` | `GET` | Retrieve all user's friends | `id` - the  user's id to get the friends from |

## Notifications

| Route | HTTP Method | Description | Parameters |
| --- | :--: | --- | --- |
| `/notifications/user/{id}` | `GET` | List all notifications for a given user | `id` - the user's id |
| `/notifications/user/{id}/create` | `POST` | Create user notification | `id` - the user's id |
| `/notifications/user/{id}`| `DELETE` | Delete user notification | `id` - the user's id |

## Tournaments Users

> [!WARNING]
> - Replaced: retrieve a user for a given tournament
> - With: list all users for a given tournament

| Route | HTTP Method | Description | Parameters |
| --- | :--: | --- | --- |
| `/tournaments/{id}/user` | `GET` | List all tournament users (alias) for a given tournament | `id` - the tournament's id |
| `/tournaments/{tid}/user/{uid}`| `POST` | Create tournament alias | |
| ??? | `DELETE` | Delete tournament alias | |
