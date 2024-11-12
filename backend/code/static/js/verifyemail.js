

async function submitCode(event) {
    event.preventDefault(); 
    let formData = {};
    formData.code = document.getElementById('code').value,
    formData.email = s_email
    formData.username = s_username;
    formData.password = s_password;
    console.log(formData.email);
    const response = await fetch('/verifyemail/', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (response.ok) {
        const data = await response.json();
        if (data.redirect) {
            localStorage.setItem("access_token", JSON.stringify(data.access_token))
            localStorage.setItem("refresh_token", JSON.stringify(data.refresh_token))
            history.pushState(null, '', `/home/`);
            htmx.ajax('GET', `/home/`, {
                target: '#main'  
            });
        }
    } else {
        const errorData = await response.json();
        document.getElementById('errorMessage').textContent = errorData.message;  
        document.getElementById('errorMessage').style.display = 'block';
    }
}

async function resend_code_email(){
    let formData = {};
    formData.email = s_email;
    const response = await fetch(`/verifyemail/resendcode`, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json',
            }
        }); 
}