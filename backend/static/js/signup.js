
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const togglePasswordImage = document.getElementById('togglePasswordImage');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordImage.src = type === 'password' ? "/static/assets/icons/eyeopen.png" : "/static/assets/icons/eyeclosed(1).png";
    togglePasswordImage.alt = type === 'password' ? 'Show Password' : 'Hide Password';
}

function togglereconfirmButton() {
    const togglereconfirmImage = document.getElementById('togglereconfirmImage');
    const reconfirmInput = document.getElementById('reconfirm');
    const type = reconfirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
    reconfirmInput.setAttribute('type', type);
    togglereconfirmImage.src = type === 'password' ? "/static/assets/icons/eyeopen.png" : "/static/assets/icons/eyeclosed(1).png";
    togglereconfirmImage.alt = type === 'password' ? 'Show Password' : 'Hide Password';
}

document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        reconfirm: document.getElementById('reconfirm').value
    };

    const response = await fetch(`/users/create`, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json',
        },
    });
	const data = await response.json();
	if (!response.ok) {
		console.log('Login in failed');
		errorMessage.textContent = data.message;
		errorMessage.style.display = 'block';
		return ;
	}
	console.log('Login in successful');
	localStorage.setItem("access_token", JSON.stringify(data.access_token))
	localStorage.setItem("refresh_token", JSON.stringify(data.refresh_token))
	htmx.ajax('GET', `/home/`, {
		target: '#main'  
	});
});
