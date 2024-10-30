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
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        }
    });
	const data = await response.json();
	if (!response.ok) {
		console.error('Error:', response);
        errorMessage.textContent = data.message;
		errorMessage.style.display = 'block';
		return ;
	}
	
	console.log(data);

	if (data.data.hasOwnProperty('otp')) {
		history.pushState(null, '', `/otpmethod/`);
		htmx.ajax('GET', `/otpmethod/`, {
			target: '#main',
		});
	} else {
		console.log('Login in successful');
		localStorage.setItem("access_token", JSON.stringify(data.access_token))
		localStorage.setItem("refresh_token", JSON.stringify(data.refresh_token))
		history.pushState(null, '', `/home/`);
		htmx.ajax('GET', `/home/`, {
			target: '#main',
		});
	}
    

});




