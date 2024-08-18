document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');
    const passwordInput = document.getElementById('password');
    const passwordInput2 = document.getElementById('password2');
    const reconfirmInput = document.getElementById('reconfirm');
    const reconfirmInput2 = document.getElementById('reconfirm2');
    const togglePasswordButton = document.getElementById('togglePassword');
    const togglereconfirmButton = document.getElementById('togglereconfirm');
    const togglePasswordImage = document.getElementById('togglePasswordImage');
    const togglereconfirmImage = document.getElementById('togglereconfirmImage');

    loginForm.addEventListener('submit', (event) => {


        const username = loginForm.username.value.trim();
        const password = loginForm.password.value.trim();
        const reconfirm = loginForm.reconfirm.value.trim();

        if (password === reconfirm) {
            alert('Login successful!');
            passwordInput.removeAttribute('id', 'input-error');
            passwordInput2.removeAttribute('id', 'input-error2');
            reconfirmInput.removeAttribute('id', 'input-error');
            reconfirmInput2.removeAttribute('id', 'input-error2');
            // Redirect to another page or perform other actions
        } else {
            errorMessage.textContent = 'Sorry but your passwords don\'t match. Please, try again.';
            errorMessage.style.display = 'block';
            passwordInput.setAttribute('id', 'input-error');
            passwordInput2.setAttribute('id', 'input-error2');
            reconfirmInput.setAttribute('id', 'input-error');
            reconfirmInput2.setAttribute('id', 'input-error2');
            

        }
    });

    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordImage.src = type === 'password' ? "/static/assets/icons/eyeopen.png" : "/static/assets/icons/eyeclosed(1).png";
        togglePasswordImage.alt = type === 'password' ? 'Show Password' : 'Hide Password';
    });
    togglereconfirmButton.addEventListener('click', () => {
        const type = reconfirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
        reconfirmInput.setAttribute('type', type);
        togglereconfirmImage.src = type === 'password' ? "/static/assets/icons/eyeopen.png" : "/static/assets/icons/eyeclosed(1).png";
        togglereconfirmImage.alt = type === 'password' ? 'Show Password' : 'Hide Password';
    });
});