

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

function handleInput(current, nextId) {
    // Automatically move to the next box
    if (current.value.length === current.maxLength && nextId) {
      document.getElementById(nextId).focus();
    }

    // Update the hidden input with the full code
    updateHiddenCode();
}

function handleBackspace(event, current, prevId) {
    // Check if the Backspace key is pressed and the current box is empty
    if (event.key === "Backspace" && current.value === "" && prevId) {
      // Move focus to the previous box and clear its value
      const prevInput = document.getElementById(prevId);
      prevInput.focus();
      prevInput.value = ""; // Clear the previous box
      updateHiddenCode(); // Update the hidden input
      event.preventDefault(); // Prevent the browser from handling Backspace in the usual way
    }
}

function updateHiddenCode() {
    // Concatenate the values from each input box
    const code = Array.from({ length: 6 }, (_, i) => 
      document.getElementById(`digit${i + 1}`).value
    ).join('');
    document.getElementById('code').value = code;
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