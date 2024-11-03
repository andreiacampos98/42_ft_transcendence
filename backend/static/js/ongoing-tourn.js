console.log(user);

const fillPlayersSlot = (query, players) => {
	const slots = document.querySelectorAll(query);
	console.log(query, slots);	
	
	players.forEach((player, i) => {
		slots[i].querySelector("span.name").textContent = player.alias;
		slots[i].querySelector("img").src = player.user.picture;
	});
};

user.connectSocket(
	'tournamentSocket', 
	`ws://${window.location.host}/ws/tournaments/${user.tournamentID}`, 
	(event) => {
		const message = JSON.parse(event.data);
		const { event: eventType, data } = message;
		console.log(message);

		if (eventType == 'USER_JOINED') {
			fillPlayersSlot(".player", data);
		}
		else if (eventType == 'BEGIN_PHASE') {
			setTimeout(() => {
				user.tournamentGameData = data;
				history.pushState(null, '', `/gametournament/`);
				htmx.ajax('GET', `/gametournament/`, {
					target: '#main'  
				});
			}, 2000);
		}
		else if (eventType == 'END_PHASE') {
			console.log(data.phase);
			setTimeout(() => {
				fillPlayersSlot(`.${data.phase}.player`, data.players);
			}, 1100);
		}
		else if (eventType == 'END_TOURNAMENT') {			
			setTimeout(() => {
				fillPlayersSlot(".winner.player", [data.winner]);
			}, 2000);
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