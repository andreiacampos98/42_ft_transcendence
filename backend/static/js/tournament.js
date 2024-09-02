/*function setStatus(elementId, status) {
    const friendBlock = document.getElementById(elementId);
    const statusSpan = friendBlock.querySelector('.status');
    
    // Set the data-status attribute
    friendBlock.setAttribute('data-status', status);

    // Update the status text
    statusSpan.textContent = status.charAt(0).toUpperCase() + status.slice(1);
}

// Example usage
setStatus('friend1', 'online');  // Can be 'online', 'offline', or 'playing'
setStatus('friend2', 'offline');  // Can be 'online', 'offline', or 'playing'
setStatus('friend3', 'playing');  // Can be 'online', 'offline', or 'playing'

*/


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
var span = document.getElementsByClassName("close")[0];

var goback = document.getElementById("cancel-create-tournament");
// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}
// When the user clicks on  (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
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

function getCreateTournament()
{
    const userId = document.querySelector('button[onclick="getCreateTournament()"]').getAttribute('data-user-id');

    var formData = {
        "name": document.getElementById("new-tournament-name").value,
        "capacity":  document.getElementById("numPlayers").value,
        "host_id": userId,
        "alias": document.getElementById("nickname-input-create").value,
        "status": 'Open'
    };
    console.log(formData)

    fetch(`/tournaments/create`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.data != {}) {
            alert("Tournament created successfully!");
            const tournamentId = data.data.id; // Ajuste conforme o formato da resposta
            console.log(data.data);
            localStorage.setItem('alias', formData.alias);
            localStorage.setItem('tournament_id', tournamentId);
            // window.location.href = `/tournaments/ongoing/${tournamentId}`;
            htmx.ajax('GET', `/tournaments/ongoing/${tournamentId}`, {
                target: '#main' , 
            });
        } else {
            alert("Error: " + (data.message || 'Unknown error'));
        }
    })
    .catch(error => console.error('Error:', error));
}

