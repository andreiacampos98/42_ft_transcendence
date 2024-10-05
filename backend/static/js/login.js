function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const togglePasswordImage = document.getElementById('togglePasswordImage');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordImage.src = type === 'password' ? "/static/assets/icons/eyeopen.png" : "/static/assets/icons/eyeclosed(1).png";
    togglePasswordImage.alt = type === 'password' ? 'Show Password' : 'Hide Password';
}


document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    fetch(``, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        }
    })
    .then(response => response.json()) 
    .then(data => {
        console.log(data);
        if (Object.keys(data.data).length === 0) {
            errorMessage.textContent = data.message;
            errorMessage.style.display = 'block';
        } else if (data.data.hasOwnProperty('otp')) {
            history.pushState(null, '', `/otpmethod/`);
            htmx.ajax('GET', `/otpmethod/`, {
                target: '#main',
            });
        } else {
            console.log('Login in successful');
            history.pushState(null, '', `/home/`);
            htmx.ajax('GET', `/home/`, {
                target: '#main',
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorMessage.textContent = 'An unexpected error occurred. Please try again later.';
        errorMessage.style.display = 'block';
    });
});




