async function checkTokenBeforeNavigation(event) {
    let token = localStorage.getItem("access_token");
    const response = await fetch(`/tokencheck/`, {
        method: 'GET',
        headers: {
            "Authorization": localStorage.getItem("access_token") ? `Bearer ${token}` : null,
        }
    });
    const data = await response.json();
	if (!response.ok && response.status != 401){
        localStorage.setItem("access_token", data.access_token); 
		console.error(`Error checking token.`);
    }
    else if(response.status == 401){
        alert("As your session has expired, you will be logged out.");
        history.pushState(null, '', `/`);
        htmx.ajax('GET', `/`, {
            target: '#main'
        });
    }
    localStorage.setItem("access_token", data.access_token); 
}