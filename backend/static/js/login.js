var t_email;

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const togglePasswordImage = document.getElementById('togglePasswordImage');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordImage.src = type === 'password' ? "/static/assets/icons/eyeopen.png" : "/static/assets/icons/eyeclosed(1).png";
    togglePasswordImage.alt = type === 'password' ? 'Show Password' : 'Hide Password';
}


document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    const response = await fetch(``, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json',
        }
    });
	const data = await response.json();
	if (!response.ok) {
        errorMessage.textContent = data.message;
		errorMessage.style.display = 'block';
		return ;
	}
	

	if (data.data.hasOwnProperty('otp')) {
		t_email = data.email;
		htmx.ajax('GET', `/otp/`, {
			target: '#main',
		});
	} else {
		localStorage.setItem("access_token", data.access_token); 
		localStorage.setItem("refresh_token", data.refresh_token); 
		history.pushState(null, '', `/home/`);
		htmx.ajax('GET', `/home/`, {
			target: '#main',
		});
	}
    
});




