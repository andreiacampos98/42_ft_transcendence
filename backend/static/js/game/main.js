import { MyApp } from './MyApp.js';

const gameType = document.getElementById('metadata').getAttribute('game-type');
const userID = document.getElementById('metadata').getAttribute('data-user-id');
const username = document.getElementById('metadata').getAttribute('data-username');

const setupGame = (data) => {
	let app = new MyApp();
	app.init(data);
	app.render();
};

const remoteHandler = () => {
	let socket = new WebSocket(`ws://${window.location.host}/ws/games/remote/queue`);
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
	console.log('I GOT CALLED');
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