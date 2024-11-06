class TournamentUser {
	constructor() {
		this.tournamentAlias = '';
		this.tournamentID = 0;
		this.tournamentSocket = null;
		this.gameSocket = null;
		this.tournamentGameData = null;
	}

	connectSocket(prop, url, onmessage) {
		if (this[prop])
			delete this[prop];
		this[prop] = new WebSocket(url);
		this[prop].onmessage = (event) => {
			console.log(JSON.parse(event.data));
			onmessage(event);
		}
		this[prop].onopen = (event) => console.log(`Opened WS ${url}`, event);
		this[prop].onerror = (event) => {
			console.error(`WS ${url}`, event);
			this[prop] = null;	
		};
		this[prop].onclose = (event) => {
			console.log(`Closed WS ${url}`, event);
			this[prop] = null;	
		};
	}	
};

class Tournament {
	constructor() {
		this.id = 0;
		this.phasePlayers = {
			'quarter-final': [],
			'semi-final': [],
			'final': [],
		};
		this.phaseGames = {
			'quarter-final': [],
			'semi-final': [],
			'final': [],
		};
		this.currPhase = null;
		this.firstPhase = null;
	}
	// {
	// 	"id": 128,
	// 	"phase": "final",
	// 	"created_at": "2024-11-06T21:11:59.517443Z",
	// 	"tournament_id": 74,
	// 	"game_id": {
	// 		"id": 132,
	// 		"type": "Tournament",
	// 		"start_date": "2024-11-06T21:11:59.514218Z",
	// 		"duration": 0,
	// 		"nb_goals_user1": 0,
	// 		"nb_goals_user2": 0,
	// 		"created_at": "2024-11-06T21:11:59.515433Z",
	// 		"winner_id": null,
	// 		"user1_id": 2,
	// 		"user2_id": 4
	// 	},
	// 	"user1_id": {
	// 		"id": 2,
	// 		"username": "bb",
	// 		"description": null,
	// 		"email": null,
	// 		"picture": "/media/default.jpg",
	// 		"status": "Online",
	// 		"created_at": "2024-10-31T14:16:32.437708Z",
	// 		"updated_at": "2024-11-06T21:11:59.366077Z"
	// 	},
	// 	"user2_id": {
	// 		"id": 4,
	// 		"username": "dd",
	// 		"description": null,
	// 		"email": null,
	// 		"picture": "/media/default.jpg",
	// 		"status": "Online",
	// 		"created_at": "2024-10-31T14:18:53.088894Z",
	// 		"updated_at": "2024-11-06T21:11:59.472840Z"
	// 	}
	// }

	onPlayerJoined(players) {
		this.phasePlayers[this.currPhase] = players;
		this.updateUI();
	}
	
	onPlayerLeft(player) {
		delete this.players[player.id];
	}

	onBeginPhase({phase, games}) {
		this.currPhase = phase;
		// this.phaseGames[phase] = games;

		games.forEach(tournamentGame => {
			let gameInstance = tournamentGame.game_id;
			this.phaseGames[phase][gameInstance.id] = {};
			this.phaseGames[phase][gameInstance.id][tournamentGame.user1_id.username] = 0;
			this.phaseGames[phase][gameInstance.id][tournamentGame.user2_id.username] = 0;
		});
		
		console.log('RECEIVED GAMES', games);
		console.log(`CURRENT PHASE - ${this.currPhase}`);
		console.log(`CURRENT PHASE GAMES`, this.phaseGames[this.currPhase]);
		console.log(this);
	}

	onEndPhase({phase, players}) {
		this.currPhase = phase;
		this.phasePlayers[phase] = players;
	}

	setFirstPhase(phase) {
		if (this.firstPhase == phase)
			return ;
		this.firstPhase = phase;
		this.currPhase = phase;
	}

	updateUI() {
		console.log(this);
		let phaseNames = ['quarter-final', 'semi-final', 'final'];
		let firstPhaseIndex = phaseNames.indexOf(tournament.firstPhase);
		let currPhaseIndex = phaseNames.indexOf(this.currPhase);
		
		phaseNames.forEach((phase, i) => {
			if (i < firstPhaseIndex || i > currPhaseIndex)
				return ;
			let players = this.phasePlayers[phase];
			this.updatePlayerSlots(phase, players);
		});
	}

	updatePlayerSlots(cssSelector, players) {
		const query = `.${cssSelector}.player`;
		const slots = document.querySelectorAll(query);
		
		players.forEach((player, i) => {
			slots[i].querySelector("span.name").textContent = player.alias;
			slots[i].querySelector("img").src = player.user.picture;
		});
	};
};

let user = new TournamentUser();
let tournament = new Tournament();