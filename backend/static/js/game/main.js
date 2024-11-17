import { MyApp } from './MyApp.js';

const gameType = document.getElementById('game-engine').getAttribute('game-type');
const userID = document.getElementById('game-engine').getAttribute('data-user-id');
const username = document.getElementById('game-engine').getAttribute('data-username');

const setupGame = (data) => {
	let app = new MyApp();
	app.init(data);
	app.render();
};

const remoteHandler = () => {
	let socket = new WebSocket(`wss://${window.location.host}/wss/games/remote/queue`);
	socket.onmessage = (event) => {
		const { player1, player2, ball, gameID } = JSON.parse(event.data);
		setupGame({
			player1Data: player1, 
			player2Data: player2,
			socket: socket, 
			gameType: gameType,
			gameID: gameID,
			ballDirection: ball.direction,
		});
	};
}

const localHandler = () => {
	setupGame({ 
		player1Data: {'id': userID, 'username': username},
		player2Data: {'id': '', 'username': 'Anonymous'},
		gameType: gameType 
	});
}

const handlers = {
	'Local': localHandler,
	'Remote': remoteHandler
};

handlers[gameType]();