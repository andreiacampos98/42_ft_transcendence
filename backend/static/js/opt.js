
document.getElementById('nice').textContent += t_email;

async function submitOtp(event) {
    event.preventDefault(); 
    const formData = new FormData(document.getElementById('otpForm'));
    const response = await fetch('/otp/', {
        method: 'POST',
        body: formData,
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

async function resend_code(){
    const response = await fetch(`/2fa/resendcode/`, ); 
}


function handleInput(current, nextId) {
    // Automatically move to the next box
    if (current.value.length === current.maxLength && nextId) {
      document.getElementById(nextId).focus();
    }

    // Update the hidden input with the full code
    updateHiddenCode();
}
function updateHiddenCode() {
    // Concatenate the values from each input box
    const code = Array.from({ length: 6 }, (_, i) => 
      document.getElementById(`digit${i + 1}`).value
    ).join('');
    document.getElementById('otp').value = code;
}

function handlePaste(event) {
    // Get the pasted text from the clipboard
    const pasteData = (event.clipboardData || window.clipboardData).getData('text');
    // Only process if exactly 6 digits are pasted
    if (/^\d{6}$/.test(pasteData)) {
        event.preventDefault(); // Prevent default paste behavior
        // Fill each input box with the corresponding digit
        pasteData.split('').forEach((digit, index) => {
            document.getElementById(`digit${index + 1}`).value = digit;
        });
        // Move focus to the last input box and update the hidden input
        document.getElementById('digit6').focus();
        updateHiddenCode();
    }
}