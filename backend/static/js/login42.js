document.addEventListener('DOMContentLoaded', () => {
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const accessToken = getCookie('access_token');
    const refresh_token = getCookie('refresh_token');

    if (accessToken) {
        // Armazena o token no localStorage
        localStorage.setItem('access_token', accessToken);
        console.log('Access token armazenado no localStorage:', accessToken);
    } else {
        console.warn('Access token não encontrado nos cookies.');
    }
    if (refresh_token) {
        // Armazena o token no localStorage
        localStorage.setItem('access_token', refresh_token);
        console.log('Access token armazenado no localStorage:', refresh_token);
    } else {
        console.warn('Access token não encontrado nos cookies.');
    }
});
