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
		this.reset();
	}

	onPlayerJoined({phase, players}) {
		this.setFirstPhase(phase);
		this.phasePlayers[this.currPhase] = players;
		console.log(phase, players);
		console.log(this.currPhase, this.phasePlayers);
		this.updateUI();
	}
	
	onPlayerLeft(player) {
		delete this.players[player.id];
		this.updateUI();
	}

	onPhaseStart({phase, games, players}) {
		console.log(`BEGINNING ${phase}`, games, players);
		console.log(`CURRENT PHASE`, this.currPhase);
		this.currPhase = phase;
		games.forEach(tournamentGame => {
			let gameID = tournamentGame.game_id.id;
			this.phaseGames[phase][gameID] = {};
		});

		console.log(this.phasePlayers);

		this.phasePlayers[phase] = players;
		this.updateUI();
	}

	onPhaseEnd({phase, next_phase, results, winner=null}) {
		console.log(`ENDING (${phase} -> ${next_phase})`, results);
		console.log(`CURRENT PHASE`, this.currPhase);
		results.forEach(game => {
			this.phaseGames[phase][game.id][game.username1] = game.score1;
			this.phaseGames[phase][game.id][game.username2] = game.score2;
		});
		this.lastPhase = this.currPhase;
		this.currPhase = next_phase ? next_phase : this.currPhase;
		this.updateUI();

		if (winner)
			this.onTournamentEnd(winner);
		console.log(this.phaseGames);
	}

	onTournamentEnd(winner){
		this.updatePlayerSlots('winner', [winner]);
		this.reset();
		user.tournamentSocket.close();
	}

	reset(){
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
			slots[0].classList.add('winner-player');
			document.querySelector(".score2 img").src="/static/assets/icons/trophy-brown.png";
			return ;
		}

		scores.forEach((nbGoals, i) => {
			slots[i].querySelector("span.score").textContent = nbGoals;
		});
	};

	highlightPlayerPaths(phase, scores) {
		const query = `.${phase}.player`;
		const playerSlots = document.querySelectorAll(query);

		if (this.firstPhase == this.currPhase)
			return ;
			
		scores.forEach((score, i) => {
			if (score == 5){
				playerSlots[i].classList.add('winner-player');
				playerSlots[i].querySelector(".score2").classList.add("winner-score-container");
				playerSlots[i].querySelector(".score").classList.add("winner-score");
				document.querySelectorAll(`.${phase}-line-${i}`).forEach(l => 
					l.classList.add("winner-path")
				);
			}
			else {
				playerSlots[i].classList.add('loser-player');
				document.querySelectorAll(`.${phase}-line-${i}`).forEach(l => 
					l.classList.add("loser-path")
				);
			}
		});
		document.querySelectorAll(`.${phase}-line`).forEach(l => l.classList.add('winner-path'));
	}
};

let user = new TournamentUser();
let tournament = new Tournament();