import { MyApp } from './MyApp.js';

const gameType = document.getElementById('game-engine').getAttribute('game-type');
const currUserId = document.getElementById('game-engine').getAttribute('data-user-id');

if (gameType == "Remote") {
	let socket = new WebSocket(`ws://${window.location.host}/ws/games/remote/queue`);
	socket.onopen = (event) => {
		console.log('Socket opening', event);
	};
	
	socket.onmessage = (event) => {
		const { player1, player2, direction } = JSON.parse(event.data);
		const player = player1.id == currUserId ? player1 : player2;
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
	app.init({ gameType: gameType });
	app.render();
}