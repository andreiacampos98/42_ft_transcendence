document.getElementById('auth-method-select').addEventListener('change', function() {
    const authForm = document.getElementById('auth-method-form');
    const selectedMethod = this.value;

    let formContent = '';

    if (selectedMethod === 'sms') {
        formContent = `
            <label for="phone">Enter your phone number:</label>
            <input type="text" id="phone" name="phone" placeholder="Your phone number">
        `;
    } else if (selectedMethod === 'auth_app') {
        formContent = `
            <label for="auth-code">Enter the code from your authenticator app:</label>
            <input type="text" id="auth-code" name="auth-code" placeholder="Authenticator app code">
        `;
    } else if (selectedMethod === 'email') {
        formContent = `
            <label for="email">Enter your email address:</label>
            <input type="email" id="email" name="email" placeholder="Your email address">
        `;
    }

    authForm.innerHTML = formContent;
});

document.getElementById('submit-auth').addEventListener('click', function() {
    const selectedMethod = document.getElementById('auth-method-select').value;
    let data = {};

    if (selectedMethod === 'sms') {
        data.info = document.getElementById('phone').value;
        data.method = 'sms'
    } else if (selectedMethod === 'auth_app') {
        data.info = document.getElementById('auth-code').value;
        data.method = 'auth_app'
    } else if (selectedMethod === 'email') {
        data.info = document.getElementById('email').value;
        data.method = 'email'
    }

    // Make an AJAX call or submit the form data here
    console.log('Submitting data for', selectedMethod, data);
    fetch(`/otpmethod/`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json()) 
    .then(data => {
        console.log(data);
        if (JSON.stringify(data.data) === '{}') {
            alert(data.message);
        } else {
            history.pushState(null, '', `/otp/`);
            htmx.ajax('GET', `/otp/`, {
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