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

async function registerTournament() {
    var tournamentId = document.getElementById("registration").getAttribute("data-tournament-id");
    var userId = document.getElementById("registration").getAttribute("data-user-id");
    
    // Prepare form data and send via fetch API
    var formData = {
        "alias": document.getElementById("nickname-input-join").value
    };
    console.log(formData)
    
    try {
        const response = await fetch(`/tournaments/${tournamentId}/users/${userId}/join`, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        })
        const data = await response.json();
        console.log(data)
        console.log("aqui")
        console.log(data.data)
        if (response.ok) {
            alert("Registered successfully!");
            localStorage.setItem('alias', formData.alias);
            localStorage.setItem('tournament_id', tournamentId);
            window.location.href = `/tournaments/ongoing/${tournamentId}`;
        } else {
            alert("Registration failed: " + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
    }
}


