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

document.getElementById('submit-auth').addEventListener('click', async function() {
    const selectedMethod = document.getElementById('auth-method-select').value;
    let formData = {};

    if (selectedMethod === 'sms') {
        formData.info = document.getElementById('phone').value;
        formData.method = 'sms'
    } else if (selectedMethod === 'auth_app') {
        formData.info = document.getElementById('auth-code').value;
        formData.method = 'auth_app'
    } else if (selectedMethod === 'email') {
        formData.info = document.getElementById('email').value;
        formData.method = 'email'
    }

    // Make an AJAX call or submit the form data here
    console.log('Submitting data for', selectedMethod, formData);
    const response = await fetch(`/otpmethod/`, {
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

    history.pushState(null, '', `/otp/`);
	htmx.ajax('GET', `/otp/`, {
		target: '#main',
	});
});