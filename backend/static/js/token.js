async function checkTokenBeforeNavigation(event) {
    const response = await fetch(`/tokencheck/`, {
        method: 'GET'
    });
    const data = await response.json();
	if (!response.ok && response.status != 401)
		console.error(`Error checking token.`);
    else if(response.status == 401){
        alert("As your session has expired, you will be logged out.");
        history.pushState(null, '', `/`);
        htmx.ajax('GET', `/`, {
            target: '#main'
        });
    }
}