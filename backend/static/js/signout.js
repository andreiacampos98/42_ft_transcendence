async function onSignout() {   
    const response = await fetch(`/signout/`, {
        method: "POST",
        headers: {
            "Authorization": localStorage.getItem("access_token") ? `Bearer ${localStorage.getItem("access_token")}` : null,
            "Content-Type": "application/json"
        }
    });
	const data = await response.json();
	if (!response.ok)
		alert(data.message);
	else {
		localStorage.removeItem("access_token");
		history.pushState(null, '', '/');
		htmx.ajax('GET', `/`, {
			target: '#main'  
		});
	}
}
