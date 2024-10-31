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
		this[prop].onmessage = onmessage;
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

let user = new TournamentUser();