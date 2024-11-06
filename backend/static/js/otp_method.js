var email;

document.getElementById('submit-auth').addEventListener('click', async function() {

    let formData = {};
    formData.info = document.getElementById('email').value;
    email=formData.info;
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