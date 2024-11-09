window.onload = function () {
    console.log("aqui");
    // Verificar se há um objeto de resposta JSON contendo os tokens
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');  // 'message' pode ser alterado conforme necessário
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (message && accessToken && refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        history.pushState(null, '', `/home/`);
		htmx.ajax('GET', `/home/`, {
			target: '#main',
		});
    }
};
