async function friends_add(event, userId1, userId2) {
    event.preventDefault(); 

    const response = await fetch(`/friends/${userId1}/${userId2}`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'user1_id': userId1,
            'user2_id': userId2
        })
    });

	const data = await response.json();
	if (!response.ok)
		alert(data.message)
	else
		window.location.reload();
		
    return false;
}

async function friends_remove(event, userId1, userId2) {
    event.preventDefault(); 
    const response = await fetch(`/friends/${userId1}/${userId2}`, {
        method: 'DELETE',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        }
    });

	const data = await response.json();
    if (!response.ok)
		alert(data.message);
	else
		window.location.reload();
	
    return false;
}
