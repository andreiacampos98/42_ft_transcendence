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
			console.log(`Closing ${url}`);
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
		history.replaceState(null, '', `/tournaments/`);
		htmx.ajax('GET', `/tournaments/`, {
			target: '#main'  
		});
	}
};

class Tournament {
	constructor() {
		this.reset();
		this.isCancelled = false;
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
		if (this.isCancelled)
			return ;
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
		if (this.isCancelled)
			return ;
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
	
	onCancelTournament(){
		this.isCancelled = true;
		const handler = () => {
			document.querySelector('.tourn-status').textContent = 'This tournament has been cancelled. Reason: 2 or more players left.';
			document.querySelector('.tourn-status').style.color = '#FF0000';
			this.reset();
			myUser.disconnectSocket('gameSocket');
			myUser.disconnectSocket('tournamentSocket');
		}

		if (currRoute.startsWith('/tournaments/ongoing')) {
			handler();
			return ;
		}

		history.replaceState(null, '', `/tournaments/ongoing/${myUser.tournamentID}`);
		htmx.ajax('GET', '/tournaments', {
			target: '#main'
		}).then(() => handler());
		
	}

	onTimeout(gameID, p1, p2) {
		console.log(`P1 ID: ${p1.id}, P2 ID: ${p2.id}, User ID: ${myUser.userID}`);
		let gameReport = {
			"id": gameID, 
			"duration": 0,
			"nb_goals_user1": p1.id == myUser.userID ? 5 : 0,
			"nb_goals_user2": p2.id == myUser.userID ? 5 : 0,
			"game_stats": {
				"shorter_rally": 0,
				"longer_rally": 0,
				"average_rally": 0,
				"min_ball_speed": 0,
				"max_ball_speed": 0,
				"average_ball_speed": 0,
				"greatest_deficit_overcome": 0,
				"gdo_user": p1.id == myUser.userID ? p1.id : p2.id,
				"most_consecutive_goals": 0,
				"mcg_user": p1.id == myUser.userID ? p1.id : p2.id,
				"biggest_lead": 0,
				"bg_user": p1.id == myUser.userID ? p1.id : p2.id,
			},
			"user1_stats": {
				"scored_first": false
			},
			"user2_stats": {
				"scored_first": false
			},
			"goals": []		
		};
		let other = p1.id == myUser.userID ? p2 : p1;
		this.phaseGames[this.currPhase][gameID][p1.username] = p1.id == myUser.userID ? 5 : 0;
		this.phaseGames[this.currPhase][gameID][p2.username] = p2.id == myUser.userID ? 5 : 0;

		console.log(other);
		for (let i = 0; i < this.phasePlayers[this.currPhase].length; i++) {
			console.log(this.phasePlayers[this.currPhase][i].user_id);
			if (this.phasePlayers[this.currPhase][i].user_id == other.id)
				this.phasePlayers[this.currPhase][i].disconnected = true;
		}

		console.log(this.phasePlayers);

		myUser.tournamentSocket.send(JSON.stringify({
			'event': 'GAME_END',
			'data': gameReport
		}));
		myUser.disconnectSocket('gameSocket');
		history.replaceState(null, '', `/tournaments/ongoing/${myUser.tournamentID}`);
		htmx.ajax('GET', `/tournaments/ongoing/${myUser.tournamentID}`, {
			target: '#main'
		});
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

		console.log(this);
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
		console.log(cssSelector, players, scores);
		players.forEach((player, i) => {
			if (player.disconnected) {
				slots[i].querySelector("span.name").textContent = 'DISCONNECTED';
				slots[i].querySelector("span.name").classList.add('player-disconnected');
			}
			else
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