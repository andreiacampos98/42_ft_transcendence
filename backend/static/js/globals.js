export class User {
	constructor() {
		this.tournamentSocket = 1;
		this.remoteSocket = 2;
	}

	connectTournamentSocket(url, onmessage) {
		this.tournamentSocket = new WebSocket(url);
		this.tournamentSocket.onmessage = onmessage;
	}
	
	connectRemoteSocket(url, onmessage) {
		this.tournamentSocket = new WebSocket(url);
		this.tournamentSocket.onmessage = onmessage;
	}
};

let user = new User()
