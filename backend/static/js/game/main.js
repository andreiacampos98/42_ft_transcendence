import { MyApp } from './MyApp.js';

const gameType = document.getElementById('game-engine').getAttribute('game-type');
const userID = document.getElementById('game-engine').getAttribute('data-user-id');
const username = document.getElementById('game-engine').getAttribute('data-username');

if (gameType == "Remote") {
	let socket = new WebSocket(`ws://${window.location.host}/ws/games/remote/queue`);
	socket.onmessage = (event) => {
		const { player1, player2, direction } = JSON.parse(event.data);
		let player, enemy, ballDirection;
		console.log(`Direction`, direction);
		
		if (player1.id == userID) {
			player = player1;
			enemy = player2;
			ballDirection = direction;
		}
		else {
			player = player2;
			enemy = player1;
			ballDirection = { 'x': -direction.x, 'y': direction.y };
		}
		console.log(`Ball Direction`, ballDirection);
		
		// console.log(JSON.parse(event.data));
		let app = new MyApp();
		app.init({ 
			playerData: player, 
			enemyData: enemy,
			socket: socket, 
			gameType: gameType,
			ballDirection: ballDirection,
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