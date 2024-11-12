
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && !node["htmx-internal-data"]) {
              htmx.process(node)
            }
          })
        })
      });
    observer.observe(document, {childList: true, subtree: true});
})

htmx.onLoad(() => {
    const statusElements = document.querySelectorAll('.status-tourn');

    statusElements.forEach(statusElement => {
        const statusText = statusElement.textContent.trim().toLowerCase();

        switch (statusText) {
            case 'ongoing':
                statusElement.classList.add('status-ongoing');
                break;
            case 'open':
                statusElement.classList.add('status-open');
                break;
            case 'closed':
                statusElement.classList.add('status-closed');
                break;
            default:
                break;
        }
    });
});

// Get the modal
var modal = document.getElementById("modal2");
// Get the button that opens the modal
var btn = document.getElementById("tournament-creater");
// Get the  element that closes the modal

var goback = document.getElementById("cancel-create-tournament");
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

const createTournamentButton = document.getElementById('tournament-creater');
createTournamentButton.onmouseenter = function () {
	document.getElementById('plus-icon').src = "/static/assets/icons/plus-hover.png";
}
createTournamentButton.onmouseleave = function () {
	document.getElementById('plus-icon').src = "/static/assets/icons/plus.png";
}

async function onCreateButtonClick()
{
    let token = localStorage.getItem("access_token");
    const userId = document.querySelector('button[onclick="onCreateButtonClick()"]').getAttribute('data-user-id');
    const checkbox = document.getElementById('use-username-checkbox');
    var alias;
    if(checkbox.checked)
    {
      alias = document.getElementById("nickname-input-create").getAttribute('data-user-username');
    } else {
      alias = document.getElementById("nickname-input-create").value;
    }
    var formData = {
        "name": document.getElementById("new-tournament-name").value,
        "capacity":  document.getElementById("numPlayers").value,
        "host_id": userId,
        "alias": alias,
        "status": 'Open'
    };
    console.log(formData)

    const response = await fetch(`/tournaments/create`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem("access_token") ? `Bearer ${token}` : null,
        }
    });
	const data = await response.json();
	if (!response.ok && response.status != 401){
		alert(data.message);
    localStorage.setItem('access_token', data.access_token);
  }
  else if (!response.ok && response.status == 401) {
    alert("As your session has expired, you will be logged out.");
    history.pushState(null, '', `/`);
    htmx.ajax('GET', `/`, {
        target: '#main'
    });
  } else {
    alert("Tournament created successfully!");
    const tournamentId = data.data.id;
    console.log(data.data);
    localStorage.setItem('alias', formData.alias);
    localStorage.setItem('tournament_id', tournamentId);
    localStorage.setItem('access_token', data.access_token);
    history.pushState(null, '', `/tournaments/ongoing/${tournamentId}`);
    htmx.ajax('GET', `/tournaments/ongoing/${tournamentId}`, {
      target: '#main' , 
    });
  }
    
}

var checkbox = document.getElementById('use-username-checkbox');
var nicknameInput = document.getElementById('nickname-input-create');

checkbox.addEventListener('change', function() {
    if (this.checked) {
        nicknameInput.disabled = true;  
        nicknameInput.placeholder = "Using username";
    } else {
        nicknameInput.disabled = false; 
        nicknameInput.placeholder = "Insert your nickname here";
    }
});