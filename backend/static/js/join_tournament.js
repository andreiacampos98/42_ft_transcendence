document.querySelectorAll('.open-register-tournament-modal').forEach(button => {
    button.addEventListener('click', function() {
        var tournamentId = this.getAttribute('data-tournament-id');
        var userId = document.getElementById('registration').getAttribute('data-user-id');
        
        var confirmButton = document.getElementById('registration');
        confirmButton.setAttribute('data-tournament-id', tournamentId);
        
        var modal = document.getElementById('modal');
        modal.style.display = 'block';
    });
});

var goback = document.getElementById("cancel-register-tournament");


var modal2 = document.getElementById("modal");

goback.onclick = function() {
  modal2.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal2) {
    modal2.style.display = "none";
  }
}

async function registerTournament() {
    let token = localStorage.getItem("access_token");
    var tournamentId = document.getElementById("registration").getAttribute("data-tournament-id");
    var userId = document.getElementById("registration").getAttribute("data-user-id");
    const checkbox = document.getElementById('use-usernamejoin-checkbox');

    var alias;
    if(checkbox.checked){
      alias = document.getElementById("nickname-input-join").getAttribute('data-user-username');
    } else {
      alias = document.getElementById("nickname-input-join").value;
    }
    var formData = {
        "alias": alias
    };
    
    try {
        const response = await fetch(`/tournaments/${tournamentId}/users/${userId}/join`, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json',
                "Authorization": localStorage.getItem("access_token") ? `Bearer ${token}` : null,
            }
        })
        const data = await response.json();
        if (response.ok) {
			myUser.tournamentID = tournamentId;
			myUser.userID = data.data.user_id;
            history.pushState(null, '', `/tournaments/ongoing/${tournamentId}`);
            htmx.ajax('GET', `/tournaments/ongoing/${tournamentId}`, {
                target: '#main'  
            });
        } else if (!response.ok && response.status == 401) {
            alert("As your session has expired, you will be logged out.");
            history.pushState(null, '', `/`);
            htmx.ajax('GET', `/`, {
                target: '#main'
            });
        } else {
            alert("Registration failed: " + (data.message || 'Unknown error'));
            localStorage.setItem('access_token', data.access_token);
        }
    } catch (error) {
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
