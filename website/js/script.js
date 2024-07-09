document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const passwordInput = document.getElementById('password');
    const passwordInput2 = document.getElementById('password2');
    const togglePasswordButton = document.getElementById('togglePassword');
    const togglePasswordImage = document.getElementById('togglePasswordImage');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = loginForm.username.value.trim();
        const password = loginForm.password.value.trim();

        if (username === 'admin' && password === 'password') {
            window.location.href = '/website/pages/home-view.html';
            passwordInput.removeAttribute('id', 'input-error');
            passwordInput2.removeAttribute('id', 'input-error2');
            // Redirect to another page or perform other actions
        } else {
            errorMessage.textContent = 'Sorry but your password is wrong. Please, try again.';
            errorMessage.style.display = 'block';
            passwordInput.setAttribute('id', 'input-error');
            passwordInput2.setAttribute('id', 'input-error2');
        }
    });

    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordImage.src = type === 'password' ? 'assets/icons/eyeopen.png' : './assets/icons/eyeclosed(1).png';
        togglePasswordImage.alt = type === 'password' ? 'Show Password' : 'Hide Password';
    });
});