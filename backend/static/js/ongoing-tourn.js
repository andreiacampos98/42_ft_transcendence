console.log(user);

user.connectSocket(
	'tournamentSocket', 
	`ws://${window.location.host}/ws/tournaments/${user.tournamentID}`, 
	(event) => {
		const message = JSON.parse(event.data);
		const { event: eventType, data } = message;

		if (eventType == 'USER_JOINED') {			
			tournament.onPlayerJoined(data);
		}
		else if (eventType == 'BEGIN_PHASE') {
			setTimeout(() => {
				tournament.onBeginPhase(data);
				user.tournamentGameData = null;
				for (let i = 0; i < data.games.length; i++) {
					tourGame = data.games[i];
					if (user.tournamentAlias == tourGame.user1_id.username || user.tournamentAlias == tourGame.user2_id.username)
						user.tournamentGameData = data.games[i];
				}
				if (!user.tournamentGameData)
					return ;

				history.pushState(null, '', `/gametournament/`);
				htmx.ajax('GET', `/gametournament/`, {
					target: '#main'  
				});
			}, 2100);
		}
		else if (eventType == 'END_PHASE') {
			setTimeout(() => {
				tournament.onEndPhase(data);
				if (data.winner) {
					tournament.updatePlayerSlots('winner', [data.winner]);
					user.tournamentSocket.close();
				}
			}, 1100);
		}
	}
);


// ==================================================================

async function leaveTournament() {
    var tournamentId = document.getElementById("leave-tournament").getAttribute("data-tournament-id");
    var userId = document.getElementById("leave-tournament").getAttribute("data-user-id");

    try {
        const response =  await fetch(`/tournaments/${tournamentId}/users/${userId}/leave`, {
            method: 'DELETE',
        });

        if (response.ok) {
            user.tournamentSocket.send(JSON.stringify({}));
            history.pushState(null, '', `/tournaments/`);
            htmx.ajax('GET', `/tournaments/`, {
                target: '#main'  
            });
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
    }
}

// Get the modal
var modal = document.getElementById("modal");
// Get the button that opens the modal
var btn = document.getElementById("leave-tournament");
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