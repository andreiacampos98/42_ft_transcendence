document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');
    const passwordInput = document.getElementById('password');
    const reconfirmInput = document.getElementById('reconfirm');
    const togglePasswordButton = document.getElementById('togglePassword');
    const togglereconfirmButton = document.getElementById('togglereconfirm');
    const togglePasswordImage = document.getElementById('togglePasswordImage');
    const togglereconfirmImage = document.getElementById('togglereconfirmImage');

    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();  // Impede o envio padrão do formulário

        const username = signupForm.username.value.trim();
        const password = signupForm.password.value.trim();
        const reconfirm = signupForm.reconfirm.value.trim();

        // Limpar mensagens de erro anteriores
        errorMessage.style.display = 'none';

        if (password !== reconfirm) {
            errorMessage.textContent = 'Sorry but your passwords don\'t match. Please, try again.';
            errorMessage.style.display = 'block';
            return;
        }

        // Enviar os dados via AJAX (fetch)
        fetch('/users/create', {  // Certifique-se de que o URL esteja correto
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()  // Função para obter o token CSRF
            },
            body: JSON.stringify({ username: username, password: password, reconfirm: reconfirm })
        })
        .then(response => response.json())  // Analisar a resposta JSON
        .then(data => {
            if (data.success) {
                // Se a inscrição for bem-sucedida
                alert(data.message);  // Ou você pode redirecionar ou mostrar a mensagem no DOM
                window.location.href = '/home/';  // Redireciona para a página de login
            } else {
                // Se ocorrer um erro
                errorMessage.textContent = data.message;
                errorMessage.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'An unexpected error occurred. Please try again later.';
            errorMessage.style.display = 'block';
        });
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

    // Função para obter o token CSRF
    function getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Verifica se esta string do cookie começa com o nome que queremos
                if (cookie.substring(0, 10) === ('csrftoken' + '=')) {
                    cookieValue = cookie.substring(10);
                    break;
                }
            }
        }
        return cookieValue;
    }
});
