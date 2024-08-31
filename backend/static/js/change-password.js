// Get the modal
var modal = document.getElementById("modal");
// Get the button that opens the modal
var btn = document.getElementById("open-change-password-modal");
// Get the  element that closes the modal
var span = document.getElementsByClassName("close")[0];

var goback = document.getElementById("cancel-change-password-button");
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

function getChangePassword()
{
    const userId = document.querySelector('button[onclick="getChangePassword()"]').getAttribute('data-user-id');

    const formData = new FormData(document.getElementById("change-password-form"));

    fetch(`/users/${userId}/password`, {
        method: "POST",
        body: formData,
        headers: {
            "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
        }
    })
    .then(response => response.json())
    .then(data => {
        if (JSON.stringify(data.data) === '{}') {
            alert(data.message);
        } else {
            alert(data.message); // Exibe uma mensagem de sucesso
            window.location.href = `/users/${data.username}`; // Atualiza a página para refletir as alterações
        }
    })
    .catch(error => console.error('Error:', error));
}