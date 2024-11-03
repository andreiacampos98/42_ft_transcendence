async function onSignout() { 
	let token = localStorage.getItem("access_token");

    const response = await fetch(`/signout/`, {
        method: "POST",
        headers: {
            "Authorization": localStorage.getItem("access_token") ? `Bearer ${token}` : null,
            "Content-Type": "application/json"
        }
    });
	const data = await response.json();
	if (!response.ok && response.status != 401)
		alert(data.message)
    else if (!response.ok && response.status == 401) {
		alert("As your session has expired, you will be logged out.");
		history.pushState(null, '', `/`);
		htmx.ajax('GET', `/`, {
			target: '#main'
		});
	}
	else {
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
		history.pushState(null, '', '/');
		htmx.ajax('GET', `/`, {
			target: '#main'  
		});
	}
}
