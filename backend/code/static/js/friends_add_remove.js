async function friends_add(event, userId1, userId2) {
    event.preventDefault(); 
    let token = localStorage.getItem("access_token");

    const response = await fetch(`/friends/${userId1}/${userId2}`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem("access_token") ? `Bearer ${token}` : null,
        },
        body: JSON.stringify({
            'user1_id': userId1,
            'user2_id': userId2
        })
    });

	const data = await response.json();
	if (!response.ok && response.status != 401){
        localStorage.setItem('access_token', data.access_token);
		alert(data.message)
    }
    else if (!response.ok && response.status == 401) {
		alert("As your session has expired, you will be logged out.");
		history.pushState(null, '', `/`);
		htmx.ajax('GET', `/`, {
			target: '#main'
		});
	}
	else{
        localStorage.setItem('access_token', data.access_token);
		window.location.reload();
    }
		
    return false;
}

async function friends_remove(event, userId1, userId2) {
    event.preventDefault(); 
    let token = localStorage.getItem("access_token");
    const response = await fetch(`/friends/${userId1}/${userId2}`, {
        method: 'DELETE',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem("access_token") ? `Bearer ${token}` : null,
        }
    });

	const data = await response.json();
    if (!response.ok && response.status != 401){
        localStorage.setItem('access_token', data.access_token);
		alert(data.message)
    }
    else if (!response.ok && response.status == 401) {
		alert("As your session has expired, you will be logged out.");
		history.pushState(null, '', `/`);
		htmx.ajax('GET', `/`, {
			target: '#main'
		});
	}
	else{
        localStorage.setItem('access_token', data.access_token);
		window.location.reload();
    }
	
    return false;
}
