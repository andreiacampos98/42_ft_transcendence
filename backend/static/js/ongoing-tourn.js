myUser.connectSocket(
	'tournamentSocket', 
	`wss://${window.location.host}/wss/tournaments/${myUser.tournamentID}`, 
	(event) => {
		const message = JSON.parse(event.data);
		const { event: eventType, data } = message;

		if (eventType == 'PLAYER_JOINED') {			
			myTournament.onPlayerJoined(data);
		}
		else if (eventType == 'PLAYER_LEFT') {			
			myTournament.onPlayerLeft(data);
		}
		else if (eventType == 'PHASE_START') {
			setTimeout(() => {
				myTournament.onPhaseStart(data);

				myUser.tournamentGameData = null;
				data.games.forEach(game => {
					if (myUser.userID == game.user1_id.id || myUser.userID == game.user2_id.id)
						myUser.tournamentGameData = game;
				})
				if (!myUser.tournamentGameData)
					return ;

				history.pushState(null, '', `/gametournament/`);
				htmx.ajax('GET', `/gametournament/`, {
					target: '#main'  
				});
			}, 2100);
		}
		else if (eventType == 'PHASE_END') {
			setTimeout(() => {
				myTournament.onPhaseEnd(data);
			}, 1100);
		}
	}
);



var modal = document.getElementById("modal");
var btn = document.getElementById("leave-tournament-button");
var goback = document.getElementById("cancel");

btn.onclick = function() {
  modal.style.display = "block";
}

goback.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

document.getElementById('leaver').onclick = (event) => myUser.leaveTournament();