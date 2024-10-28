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

console.log('I RAN');

var goback = document.getElementById("cancel-register-tournament");


var modal2 = document.getElementById("modal");

goback.onclick = function() {
  modal2.style.display = "none";
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal2) {
    modal2.style.display = "none";
  }
}

// fazer fetch(tournaments/<int:tournament_id>/users/<int:user_id>/join)
//com a resposta do fetch anterior vou enviar para socket atraves do send ou fetch(ws/tournaments/${tournament_id})

async function registerTournament() {
    var tournamentId = document.getElementById("registration").getAttribute("data-tournament-id");
    var userId = document.getElementById("registration").getAttribute("data-user-id");
    const checkbox = document.getElementById('use-usernamejoin-checkbox');

    var alias;
    if(checkbox.checked)
    {
      alias = document.getElementById("nickname-input-join").getAttribute('data-user-username');
    } else {
      alias = document.getElementById("nickname-input-join").value;
    }
    // Prepare form data and send via fetch API
    var formData = {
        "alias": alias
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
            localStorage.setItem('alias', formData.alias);
            localStorage.setItem('tournament_id', tournamentId);
            history.pushState(null, '', `/tournaments/ongoing/${tournamentId}`);
            htmx.ajax('GET', `/tournaments/ongoing/${tournamentId}`, {
                target: '#main'  
            });
        } else {
            alert("Registration failed: " + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
    }
}

var checkboxf = document.getElementById('use-usernamejoin-checkbox');
var nickname = document.getElementById('nickname-input-join');

checkboxf.addEventListener('change', function() {
    if (this.checked) {
        nickname.disabled = true;  
        nickname.placeholder = "Using username";
    } else {
        nickname.disabled = false; 
        nickname.placeholder = "Insert your nickname here";
    }
});
