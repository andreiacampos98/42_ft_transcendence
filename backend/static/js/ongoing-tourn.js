var firstPhase = '';
const fillPlayerSlots = (selector, players) => {
	const query = `.${selector}.player`;
	const slots = document.querySelectorAll(query);
	console.log(query, slots);
	
	players.forEach((player, i) => {
		slots[i].querySelector("span.name").textContent = player.alias;
		slots[i].querySelector("img").src = player.user.picture;
	});
	
};

const updateTournamentUI = (currPhase, currPhasePlayers) => {	
	let key = `tournament-${user.tournamentID}-${currPhase}`;
	console.log(currPhase, currPhasePlayers);
	if (currPhasePlayers)
		localStorage.setItem(key, JSON.stringify(currPhasePlayers));
	
	let selectors = ['quarter-final', 'semi-final', 'final'];
	let firstPhaseIndex = selectors.indexOf(firstPhase);
	let currPhaseIndex = selectors.indexOf(currPhase);
	console.log(firstPhaseIndex, currPhaseIndex + 1);
	let phases = selectors.slice(firstPhaseIndex, currPhaseIndex + 1);
	console.log(phases);
	
	phases.forEach((phase) => {
		let rawPlayers = localStorage.getItem(`tournament-${user.tournamentID}-${phase}`);
		let players = JSON.parse(rawPlayers);
		fillPlayerSlots(phase, players);
	});
};

console.log(user);

user.connectSocket(
	'tournamentSocket', 
	`ws://${window.location.host}/ws/tournaments/${user.tournamentID}`, 
	(event) => {
		const message = JSON.parse(event.data);
		const { event: eventType, data } = message;
		console.log(message);

		if (eventType == 'USER_JOINED') {
			firstPhase = data.phase;
			updateTournamentUI(data.phase, data.players);
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
				updateTournamentUI(data.phase, data.players);
			}, 1100);
		}
		else if (eventType == 'END_TOURNAMENT') {			
			setTimeout(() => {
				updateTournamentUI('final', null);
				fillPlayerSlots('winner', [data.winner]);
				user.tournamentSocket.close();
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