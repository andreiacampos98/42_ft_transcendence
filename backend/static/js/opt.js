
async function submitOtp(event) {
    event.preventDefault(); 
    const formData = new FormData(document.getElementById('otpForm'));
    const response = await fetch('', {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        const data = await response.json();
        if (data.redirect) {
            history.pushState(null, '', `/home/`);
            htmx.ajax('GET', `/home/`, {
                target: '#main'  
            });
        }
    } else {
        const errorData = await response.json();
        document.getElementById('errorMessage').textContent = errorData.error;  
        document.getElementById('errorMessage').style.display = 'block';
    }
}