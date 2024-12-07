
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
var s_email;
var s_username;
var s_password;

document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        reconfirm: document.getElementById('reconfirm').value
    };
    s_email = formData.email;
    s_username = formData.username;
    s_password = formData.password;
    const response = await fetch(`/users/create`, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json',
        },
    });
	const data = await response.json();
	if (!response.ok) {
		errorMessage.textContent = data.message;
		errorMessage.style.display = 'block';
		return ;
	}
	htmx.ajax('GET', `/verifyemail/`, {
		target: '#main'  
	});
});
