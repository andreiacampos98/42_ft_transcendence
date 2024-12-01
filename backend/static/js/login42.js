document.addEventListener('DOMContentLoaded', () => {
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const accessToken = getCookie('access_token');
    const refresh_token = getCookie('refresh_token');

    if (accessToken)
        localStorage.setItem('access_token', accessToken);
    if (refresh_token)
        localStorage.setItem('access_token', refresh_token);
});
