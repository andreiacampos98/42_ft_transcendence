document.querySelectorAll('.open-register-tournament-modal').forEach(button => {
    button.addEventListener('click', function() {
        var tournamentId = this.getAttribute('data-tournament-id');
        console.log(tournamentId)
        var userId = document.getElementById('registration').getAttribute('data-user-id');
        
        // Defina o atributo do ID do torneio no botão de confirmação dentro do modal
        var confirmButton = document.getElementById('registration');
        confirmButton.setAttribute('data-tournament-id', tournamentId);
        
        // Agora abra o modal
        var modal = document.getElementById('modal');
        modal.style.display = 'block';
    });
});

// Código para fechar o modal
document.querySelector('.close').addEventListener('click', function() {
    var modal = document.getElementById('modal');
    modal.style.display = 'none';
});

// fazer fetch(tournaments/<int:tournament_id>/users/<int:user_id>/join)
//com a resposta do fetch anterior vou enviar para socket atraves do send ou fetch(ws/tournaments/${tournament_id})

function registerTournament() {
    var tournamentId = document.getElementById("registration").getAttribute("data-tournament-id");
    var userId = document.getElementById("registration").getAttribute("data-user-id");
    
    // Prepare form data and send via fetch API
    var formData = {
        "nickname": document.getElementById("nickname-input").value,
        "tournament_id": tournamentId,
        "user_id": userId
    };
    
    fetch(`/tournaments/${tournamentId}/users/${userId}/join`, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        }
    })
    .then(response => response.json())
    .then(data => {
        if (response.ok) {
            alert("Registered successfully!");
            document.getElementById('modal').style.display = "none";
        } else {
            alert("Registration failed: " + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}





// const tournament_id = document.querySelector("#tour-id").innerHTML

async function handleWebSocketTournament(tournament_id) 
{
    const socket = new WebSocket(`ws://localhost:8002/ws/tournaments/${tournament_id}`);


    socket.onopen = (event) => {
        console.log('Socket opening', event);
    };

    socket.onmessage = (event) => {
        console.log(JSON.parse(event.data));
        return false;
    };

    socket.onclose = (event) => {
        console.log('Socket closed', event);
    };
}
// socket.send(JSON.stringify({
//     'name': 'Nuno',
//     'alias': 'Nuno67713'
// }));