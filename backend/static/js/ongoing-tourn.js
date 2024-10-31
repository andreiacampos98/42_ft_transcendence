// ==================================================================
tournamentId = localStorage.getItem('tournament_id');
console.log(tournamentId);

tournamentSocket = new WebSocket(`ws://${window.location.host}/ws/tournaments/${tournamentId}`);
tournamentSocket.onopen = (event) => {
    console.log('Socket opening', event);
};

tournamentSocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
		
	if (message.event == 'USER_JOINED') {
		const players = message.data;		
		const playerSlots = document.querySelectorAll(".player");

		players.forEach((player, i) => {
			playerSlots[i].querySelector("span.name").textContent = player.alias;
			playerSlots[i].querySelector("img").src = player.user.picture;
		});
	}
	else if (message.event == 'BEGIN_PHASE') {
		localStorage.setItem('game', JSON.stringify(message.data));
		history.pushState(null, '', `/gametournament/`);
		htmx.ajax('GET', `/gametournament/`, {
			target: '#main'  
		});
	}
};

tournamentSocket.onerror = (error) => {
    console.error('WebSocket error:', error);
};

tournamentSocket.onclose = (event) => {
    console.log('Socket closed', event);
};


// ==================================================================

async function leaveTournament() {
    var tournamentId = document.getElementById("leave-tournament").getAttribute("data-tournament-id");
    var userId = document.getElementById("leave-tournament").getAttribute("data-user-id");

    try {
        const response =  await fetch(`/tournaments/${tournamentId}/users/${userId}/leave`, {
            method: 'DELETE',
        });

        if (response.ok) {
            tournamentSocket.send(JSON.stringify({}));
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