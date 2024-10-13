import { MyApp } from './MyApp.js';

const gameType = document.getElementById('game-engine').getAttribute('game-type');
const userID = document.getElementById('game-engine').getAttribute('data-user-id');
const username = document.getElementById('game-engine').getAttribute('data-username');

if (gameType == "Remote") {
	let socket = new WebSocket(`ws://${window.location.host}/ws/games/remote/queue`);
	socket.onmessage = (event) => {
		const { player1, player2, direction } = JSON.parse(event.data);
		console.log(`Direction`, direction);
		
		let app = new MyApp();
		app.init({ 
			player1Data: player1, 
			player2Data: player2,
			socket: socket, 
			gameType: gameType,
			ballDirection: direction,
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