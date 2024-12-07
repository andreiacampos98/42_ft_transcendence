class User {
	constructor() {
		this.userID = 0;
		this.tournamentAlias = '';
		this.tournamentID = 0;
		this.tournamentGameData = null;
		this.tournamentSocket = null;
		this.gameSocket = null;
	}

	connectSocket(prop, url, onmessage) {
		if (this[prop])
			return ;
		this[prop] = new WebSocket(url);
		this[prop].onmessage = (event) => {
			onmessage(event);
		}
		this[prop].onerror = (event) => {
			this[prop] = null;	
		};
		this[prop].onclose = (event) => {
			this[prop] = null;	
		};
	}

	disconnectSocket(prop) {
		if (!this[prop] || this[prop].readyState != WebSocket.OPEN)
			return ;
		this[prop].close();
		delete this[prop];
		this[prop] = null;
	}
	
	attemptedToLeaveTournament(currRoute, nextRoute) {
		return (this.tournamentSocket != null 
			&& !nextRoute.startsWith('/tournaments/ongoing/')
			&& !nextRoute.startsWith('/gametournament')
			&& (currRoute.startsWith('/tournaments/ongoing/') 
			|| currRoute.startsWith('/gametournament'))
		);
	}
	
	attemptedToLeaveRemoteGame(currRoute, nextRoute) {
		return (this.gameSocket != null 
			&& !nextRoute.startsWith('/gameonline')
			&& currRoute.startsWith('/gameonline')
		);
	}

	leaveTournament() {
		myUser.disconnectSocket('tournamentSocket');
		myUser.disconnectSocket('gameSocket');
		myTournament.reset();
		history.pushState(null, '', `/tournaments/`);
		htmx.ajax('GET', `/tournaments/`, {
			target: '#main'  
		});
	}
};

class Tournament {
	constructor() {
		this.reset();
	}

	onPlayerJoined({phase, players}) {
		this.setFirstPhase(phase);
		this.phasePlayers[this.currPhase] = players;
		this.updateUI({});
	}
	
	onPlayerLeft({players}) {
		this.phasePlayers[this.currPhase] = players;
		this.resetFirstPhaseUI();
		this.updateUI({});
	}

	onPhaseStart({phase, games, players}) {
		this.currPhase = phase;
		games.forEach(tourGame => {
			let gameID = tourGame.game_id.id;
			let user1 = tourGame.user1_id.username;
			let user2 = tourGame.user2_id.username;
			this.phaseGames[phase][gameID] = {};
			this.phaseGames[phase][gameID][user1] = 0;
			this.phaseGames[phase][gameID][user2] = 0;
		});

		document.querySelector('.tourn-status').textContent = `The ${this.currPhase} phase is ongoing.`;
		this.phasePlayers[phase] = players;
		this.updateUI({});

		myUser.tournamentGameData = null;
		games.forEach(game => {
			let user1ID = game.user1_id.id;
			let user2ID = game.user2_id.id;
			if (myUser.userID == user1ID || myUser.userID == user2ID)
				myUser.tournamentGameData = game;
		})
		
		if (!myUser.tournamentGameData)
			return ;

		history.pushState(null, '', `/gametournament/`);
		htmx.ajax('GET', `/gametournament/`, {
			target: '#main'  
		});
	}

	onGameEnd(gameID, p1, p2, scores) {
		this.phaseGames[this.currPhase][gameID][p1] = scores[p1];
		this.phaseGames[this.currPhase][gameID][p2] = scores[p2];
	}

	onPhaseEnd({phase, next_phase, results, winner=null}) {
		results.forEach(game => {
			this.phaseGames[phase][game.id][game.username1] = game.score1;
			this.phaseGames[phase][game.id][game.username2] = game.score2;
		});
		this.lastPhase = this.currPhase;
		this.currPhase = next_phase ? next_phase : this.currPhase;
		this.updateUI({});

		if (winner)
			this.onTournamentEnd(winner);
	}

	onTournamentEnd(winner){
		document.querySelector('.tourn-status').textContent = 'This tournament is over.';
		document.querySelector('.tourn-status').style.color = '#F8D082';
		this.updatePlayerSlots('winner', [winner]);
		this.reset();
		myUser.disconnectSocket('tournamentSocket');
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
		this.lastPhase = phase;
	}

	resetFirstPhaseUI() {
		const playerSlots = document.querySelectorAll(`.${this.firstPhase}.player`);
		playerSlots.forEach((slot, i) => {
			slot.querySelector("span.name").textContent = `Player ${i}`;
			slot.querySelector("img").src = '/static/assets/icons/avatar.png';
		});
	}

	updateUI({isPhaseOver=true}) {
		let phaseNames = ['quarter-final', 'semi-final', 'final'];
		let firstPhaseIndex = phaseNames.indexOf(myTournament.firstPhase);
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
				this.highlightPlayerPaths(phase, scores, isPhaseOver);
		});
	}

	updatePlayerSlots(cssSelector, players, scores) {
		const query = `.${cssSelector}.player`;
		const slots = document.querySelectorAll(query);
		
		players.forEach((player, i) => {
			slots[i].querySelector("span.name").textContent = player.alias;
			let uri = player.user.picture;
			if (uri.includes('http')) 
				slots[i].querySelector("img").src = `https://${decodeURIComponent(uri).slice(14)}`;
			else 
				slots[i].querySelector("img").src = uri;
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

	highlightPlayerPaths(phase, scores, isPhaseOver) {
		const query = `.${phase}.player`;
		const playerSlots = document.querySelectorAll(query);
			
		scores.forEach((score, i) => {
			if (score == 5){
				playerSlots[i].classList.add('winner-player');
				playerSlots[i].querySelector(".score2").classList.add("winner-score-container");
				playerSlots[i].querySelector(".score").classList.add("winner-score");
				document.querySelectorAll(`.${phase}-line-${i}`).forEach(l => 
					l.classList.add("winner-path")
				);
			}
			else if (isPhaseOver) {
				playerSlots[i].classList.add('loser-player');
				document.querySelectorAll(`.${phase}-line-${i}`).forEach(l => 
					l.classList.add("loser-path")
				);
			}
		});
	}
};

let myUser = new User();
let myTournament = new Tournament();