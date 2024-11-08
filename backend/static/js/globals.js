class TournamentUser {
	constructor() {
		this.userID = 0;
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
			// console.log(JSON.parse(event.data));
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
			'quarter-final': {},
			'semi-final': {},
			'final': {},
		};
		this.lastPhase = null;
		this.currPhase = null;
		this.firstPhase = null;
	}

	onPlayerJoined({phase, players}) {
		this.setFirstPhase(phase);
		this.phasePlayers[this.currPhase] = players;
		this.updateUI();
	}
	
	onPlayerLeft(player) {
		delete this.players[player.id];
		this.updateUI();
	}

	onBeginPhase({phase, games}) {
		console.log(`BEGINNING ${phase}`, games);
		console.log(`CURRENT PHASE`, this.currPhase);
		this.currPhase = phase;
		games.forEach(tournamentGame => {
			let gameID = tournamentGame.game_id.id;
			this.phaseGames[phase][gameID] = {};
		});
		
		console.log('RECEIVED GAMES', games);
		console.log(this.phaseGames[phase]);
	}

	onEndPhase({phase, next_phase, players, results}) {
		console.log(`ENDING (${phase} -> ${next_phase})`);
		console.log(`CURRENT PHASE`, this.currPhase);
		results.forEach(game => {
			this.phaseGames[phase][game.id][game.username1] = game.score1;
			this.phaseGames[phase][game.id][game.username2] = game.score2;
		});
		this.lastPhase = this.currPhase;
		this.currPhase = next_phase ? next_phase : this.currPhase;
		this.phasePlayers[next_phase] = players;
		this.updateUI();
		console.log(this.phaseGames);
	}

	setFirstPhase(phase) {
		if (this.firstPhase == phase)
			return ;
		this.firstPhase = phase;
		this.currPhase = phase;
	}

	updateUI() {
		let phaseNames = ['quarter-final', 'semi-final', 'final'];
		let firstPhaseIndex = phaseNames.indexOf(tournament.firstPhase);
		let currPhaseIndex = phaseNames.indexOf(this.currPhase);
		let lastPhaseIndex = phaseNames.indexOf(this.lastPhase);
		
		phaseNames.forEach((phase, i) => {
			if (i < firstPhaseIndex || i > currPhaseIndex)
				return ;
			let players = this.phasePlayers[phase];
			let scores = Object
				.entries(this.phaseGames[phase])
				.map(([id, gameScore]) => Object.values(gameScore))
				.flat();
			this.updatePlayerSlots(phase, players, scores);
			if (i <= lastPhaseIndex)
				this.highlightPlayerPaths(phase, scores);
		});
	}

	updatePlayerSlots(cssSelector, players, scores) {
		const query = `.${cssSelector}.player`;
		const slots = document.querySelectorAll(query);

		players.forEach((player, i) => {
			slots[i].querySelector("span.name").textContent = player.alias;
			slots[i].querySelector("img").src = player.user.picture;
		});

		if(cssSelector == 'winner') {
			slots[0].querySelector(".score2").classList.add("winner-score-container");
			return ;
		}

		scores.forEach((nbGoals, i) => {
			slots[i].querySelector("span.score").textContent = nbGoals;
		});
	};

	highlightPlayerPaths(cssSelector, scores) {
		const query = `.${cssSelector}.player`;
		const playerSlots = document.querySelectorAll(query);

		if (this.firstPhase == this.currPhase)
			return ;

		if(cssSelector == 'winner') {
			playerSlots[0].querySelector(".score2").classList.toggle("winner-score-container");
			playerSlots[0].querySelector(".score2 img").src="/static/assets/icons/trophy-brown.png";
			playerSlots[0].classList.add('winner-player');
			return ;
		}
			
		scores.forEach((score, i) => {
			if (score == 5){
				playerSlots[i].classList.add('winner-player');
				playerSlots[i].querySelector(".score2").classList.add("winner-score-container");
				playerSlots[i].querySelector(".score").classList.add("winner-score");
				document.querySelectorAll(`.${cssSelector}-line-${i}`).forEach(line => 
					line.classList.add("winner-path")
				);
			}
			else {
				playerSlots[i].classList.add('loser-player');
				document.querySelectorAll(`.${cssSelector}-line-${i}`).forEach(line => 
					line.classList.add("loser-path")
				);
			}
		});
		console.log(`.${cssSelector}-line`);
		document.querySelectorAll(`.${cssSelector}-line`).forEach(line => 
			line.classList.add('winner-path')
		);
	}
};

let user = new TournamentUser();
let tournament = new Tournament();