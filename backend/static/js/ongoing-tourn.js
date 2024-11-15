myUser.connectSocket(
	'tournamentSocket', 
	`ws://${window.location.host}/ws/tournaments/${myUser.tournamentID}`, 
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
					console.log(myUser.userID, game);
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


// ==================================================================

// Get the modal
var modal = document.getElementById("modal");
// Get the button that opens the modal
var btn = document.getElementById("leave-tournament-button");
// Get the  element that closes the modal

var goback = document.getElementById("cancel");
// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

goback.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

document.getElementById('leaver').onclick = (event) => myUser.leaveTournament();