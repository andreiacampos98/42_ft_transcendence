import { MyApp } from './MyApp.js';

const gameType = document.getElementById('game-engine').getAttribute('game-type');
const userID = document.getElementById('game-engine').getAttribute('data-user-id');
const username = document.getElementById('game-engine').getAttribute('data-username');

if (gameType == "Remote") {
	let socket = new WebSocket(`ws://${window.location.host}/ws/games/remote/queue`);
	socket.onmessage = (event) => {
		const { player1, player2, direction } = JSON.parse(event.data);
		const player = player1.id == userID ? player1 : player2;
		const enemy = player == player1 ? player2 : player1;

		console.log(JSON.parse(event.data));
		let app = new MyApp();
		app.init({ 
			playerData: player, 
			enemyData: enemy,
			socket: socket, 
			gameType: gameType, 
		});
		app.render();
	}
}
else {
	let app = new MyApp();
	app.init({ 
		playerData: {'id': userID, 'username': username},
		enemyData: {'id': '', 'username': ''},
		gameType: gameType 
	});
	app.render();
}