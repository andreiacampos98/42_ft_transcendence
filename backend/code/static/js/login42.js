window.onload = function () {
    console.log("aqui");
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');  
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (message && accessToken && refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        history.pushState(null, '', `/home/`);
        htmx.ajax('GET', '/home/', {
            target: '#main',
        });
    } else {
        console.error("Tokens ou mensagem ausente na URL.");
    }
};
