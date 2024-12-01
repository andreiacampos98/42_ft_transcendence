async function toggle2FA() {
	const checkbox = document.getElementById('enable');
	const isChecked = checkbox.checked;
	let token = localStorage.getItem("access_token");

	try {
		const userId = document.getElementById('enable').getAttribute('data-user-id');
		const response = await fetch(`/toggle-2fa/${userId}`, {
			method: 'POST',
			headers: {
				"Authorization": localStorage.getItem("access_token") ? `Bearer ${token}` : null,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ enabled: isChecked })
		});
			
		const data = await response.json();
		if (!response.ok && response.status != 401) {
			localStorage.setItem('access_token', data.access_token);
			throw new Error('There was an issue updating the status of 2FA');
		}
		else if (response.status == 401) {
			alert("As your session has expired, you will be logged out.");
			history.pushState(null, '', `/`);
			htmx.ajax('GET', `/`, {
			target: '#main'
			});
		}
		} catch (error) {
			localStorage.setItem('access_token', data.access_token);
			alert('There was an issue changing the status of 2FA.');
		}
}

