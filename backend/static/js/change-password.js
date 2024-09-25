// Get the modal
var modal = document.getElementById("modal");
// Get the button that opens the modal
var btn = document.getElementById("open-change-password-modal");
// Get the  element that closes the modal

var goback = document.getElementById("cancel-change-password-button");
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

function getChangePassword() {
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
            // Create the modal pop-up
			modal.style.display = "none";
			var modal3 = document.getElementById("modal3");
			modal3.style.display = "block";
			document.getElementById("confirm-btn").addEventListener("click", () => {
				window.location.href = data.redirect_url;
			});
		
	}
})
.catch(error => console.error('Error:', error));
}

function toggleOldVisibility() {
    const passwordInput = document.getElementById('old_password-input');
    const togglePasswordImage = document.getElementById('togglePasswordImage');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordImage.src = type === 'password' ? "/static/assets/icons/eyeopen.png" : "/static/assets/icons/eyeclosed(1).png";
    togglePasswordImage.alt = type === 'password' ? 'Show Password' : 'Hide Password';
}

function toggleReconfirm1Visibility() {
	const reconfirmInput = document.getElementById('password1-input');
    const togglereconfirmImage = document.getElementById('togglePasswordImage2');
    const type = reconfirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
    reconfirmInput.setAttribute('type', type);
    togglereconfirmImage.src = type === 'password' ? "/static/assets/icons/eyeopen.png" : "/static/assets/icons/eyeclosed(1).png";
    togglereconfirmImage.alt = type === 'password' ? 'Show Password' : 'Hide Password';
}

function toggleReconfirm2Visibility() {
	const reconfirmInput2 = document.getElementById('password2-input');
    const togglereconfirmImage2 = document.getElementById('togglePasswordImage3');
    const type = reconfirmInput2.getAttribute('type') === 'password' ? 'text' : 'password';
    reconfirmInput2.setAttribute('type', type);
    togglereconfirmImage2.src = type === 'password' ? "/static/assets/icons/eyeopen.png" : "/static/assets/icons/eyeclosed(1).png";
    togglereconfirmImage2.alt = type === 'password' ? 'Show Password' : 'Hide Password';
}