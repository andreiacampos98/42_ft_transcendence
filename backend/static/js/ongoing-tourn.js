// ==================================================================
const tournamentId = localStorage.getItem('tournament_id');
console.log(tournamentId);

socket = new WebSocket(`ws://localhost:8002/ws/tournaments/${tournamentId}`);
socket.onopen = (event) => {
    console.log('Socket opening', event);
    socket.send(JSON.stringify({
        'alias': localStorage.getItem('alias'),
        'tournament_id': localStorage.getItem('tournament_id'),
    }));
};

socket.onmessage = (event) => {
    const players = JSON.parse(event.data);
    const playerSlots = document.querySelectorAll(".player");

    console.log('WebSocket message received:', players);

    players.forEach((player, i) => {
        playerSlots[i].querySelector("span.name").textContent = player.alias
        playerSlots[i].querySelector("img").src = player.user.picture
        // place image on the slot as well
    });
    
    return false;
};

socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};

socket.onclose = (event) => {
    console.log('Socket closed', event);
};


// ==================================================================

function updateRound2Player(elementId, player) {
    const element = document.getElementById(elementId);
    element.querySelector('.name').innerText = player.name;
    element.querySelector('.score').innerText = player.score;
    element.querySelector('.icon').src = player.icon;
}

function updateRound3Player(elementId, player) {
    const element = document.getElementById(elementId);
    element.querySelector('.name').innerText = player.name;
    element.querySelector('.score').innerText = player.score;
    element.querySelector('.icon').src = player.icon;

    // Highlight the final winner
    element.style.borderColor = '#28a745';
    element.style.backgroundColor = '#d4edda';
}

async function leaveTournament() {
    let token = localStorage.getItem("access_token");
    var tournamentId = document.getElementById("leave-tournament").getAttribute("data-tournament-id");
    var userId = document.getElementById("leave-tournament").getAttribute("data-user-id");

    try {
        const response =  await fetch(`/tournaments/${tournamentId}/users/${userId}/leave`, {
            method: 'DELETE',
            headers: {
                "Authorization": localStorage.getItem("access_token") ? `Bearer ${token}` : null,
            }
        });

        if (response.ok) {
            socket.send(JSON.stringify({}));
            history.pushState(null, '', `/tournaments/`);
            htmx.ajax('GET', `/tournaments/`, {
                target: '#main'  
            });
        } else if (!response.ok && response.status == 401) {
            alert("As your session has expired, you will be logged out.");
            history.pushState(null, '', `/`);
            htmx.ajax('GET', `/`, {
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