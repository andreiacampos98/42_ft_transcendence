class TournamentUser {
	constructor() {
		this.tournamentAlias = '';
		this.tournamentID = 0;
		this.tournamentSocket = null;
		this.gameSocket = null;
		this.tournamentGameData = {};
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
		this.phaseGames = [{
			'quarter-final': [],
			'semi-final': [],
			'final': null,
		}];
		this.currPhase = null;
		this.firstPhase = null;
	}

	onPlayerJoined(players) {
		this.phasePlayers[this.currPhase] = players;
		this.updateUI();
	}
	
	onPlayerLeft(player) {
		delete this.players[player.id];
	}

	setFirstPhase(phase) {
		if (this.firstPhase == phase)
			return ;
		this.firstPhase = phase;
		this.currPhase = phase;
	}

	// getPhasePlayers(phase) {
	// 	let players = [];

	// 	this.phaseGames[phase].forEach(game => {
	// 		players.push(game.user1_id);
	// 		players.push(game.user2_id);
	// 	});
	// 	return players;
	// }

	updateUI() {
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
		console.log(query, slots);
		
		players.forEach((player, i) => {
			slots[i].querySelector("span.name").textContent = player.alias;
			slots[i].querySelector("img").src = player.user.picture;
		});
	};
};

let user = new TournamentUser();
let tournament = new Tournament();