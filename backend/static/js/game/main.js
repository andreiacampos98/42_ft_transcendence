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
	let socket = new WebSocket(`ws://${window.location.host}/ws/games/remote/queue`);
	socket.onmessage = (event) => {
		const { player1, player2, gameID } = JSON.parse(event.data);
		setupGame({
			player1Data: player1, 
			player2Data: player2,
			socket: socket, 
			gameType: gameType,
			gameID: gameID,
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

const tournamentHandler = () => {
	const gameInfo = JSON.parse(localStorage.getItem('game'));
	const { user1_id: p1 , user2_id: p2, game_id: gameInstance, tournament_id: tourID } = gameInfo;
	console.log(gameInfo);

	let socket = new WebSocket(`ws://${window.location.host}/ws/tournaments/${tourID}/games/${gameInstance.id}`);
	socket.onmessage = (event) => {
		setupGame({ 
			player1Data: {'id': p1.id, 'username': p1.username},
			player2Data: {'id': p2.id, 'username': p2.username},
			socket: socket,
			gameType: gameType,
			gameID: gameInstance.id,
		});
	}
}

const handlers = {
	'Local': localHandler,
	'Remote': remoteHandler,
	'Tournament': tournamentHandler,
};

handlers[gameType]();