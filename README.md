<div style="text-align:center;font-size:32px;font-weight:bold">ft_transcendence</div>

## 📝 **Authorship**

- [Andreia Campos](https://github.com/andreiacampos98) (intra - [anaraujo](https://profile.intra.42.fr/users/anaraujo))
- [Francisco Vieira](https://github.com/Xyckens) (intra - [fvieira](https://profile.intra.42.fr/users/fvieira))
- [Nuno Jesus](https://github.com/Nuno-Jesus) (intra - [ncarvalh](https://profile.intra.42.fr/users/ncarvalh))

## 📒 **About**
This project was graded <strong>115/100</strong>.

The 42 school's Common Core final project is called `ft_transcendence`. Leveraging technologies like Javascript, Django, Docker and more, ft_transcendence is designed to introduce students to the world of web development, by creating their own web-application. It's purpose? To offer players the opportunity to play the old game of Pong.

As any other project, it has its own requirements. However, it's a bit more flexible regarding the features that can be implemented.

Transcendence is splitted into modules, each one approaching a different techology or concept.
As stated by the version of the [subject](./subject.pdf), we decided to tackle the following modules:

<details>
	<summary>Implemented Modules</summary>

**Web**
- Major module: Use a Framework to build the backend.
- Minor module: Use a framework or a toolkit to build the frontend.
- Minor module: Use a database for the backend.

**User Management**
- Major module: Standard user management, authentication, users across
tournaments.
- Major module: Implementing a remote authentication.

**Gameplay and user experience**
- Major module: Remote players

**AI-Algo**
- Major module: Introduce an AI Opponent.
- Minor module: User and Game Stats Dashboards

**Cybersecurity**
- Major module: Implement Two-Factor Authentication (2FA) and JWT

**Graphics**
- Major module: Use of advanced 3D techniques.

</details>

<table align=center>
	<tbody>
		<tr>
			<td><image src=""></td>
			<td><image src=""></td>
		</tr>
		<tr>
			<td><image src=""></td>
			<td><image src=""></td>
		</tr>
	</tbody>
</table>

## 🎥 **Demos**

Here, you'll find different demos, each one showcasing different areas and interactions.

<table align=center>
	<tbody>
		<tr>
			<td><video src=""></td>
			<td><video src=""></td>
		</tr>
		<tr>
			<td><video src=""></td>
			<td><video src=""></td>
		</tr>
	</tbody>
</table>


## 📦 **Building**
> [!IMPORTANT] 
> You should have `Docker` and `make` installed.

After installing the required software, just run the following.

```sh
$ make
```

Other commands: 

- `make clean` - Deletes the whole database, database migrations and `__pycache__` folders.

- `make prune` - Same as running `docker system prune`.

- `make down` - Stops the containers.

- `make ps` - Lists the running containers.

- `make re` - Same as running `make down` and `make`.
