async function getSuggestions() {
	let token = localStorage.getItem("access_token");
    var input = document.getElementById('search').value;
    var suggestionsBox = document.getElementById('suggestions');

    if (!input.length) { 
        suggestionsBox.innerHTML = ''; 
        suggestionsBox.style.display = 'none'; 
		return ;
    }
	const response = await fetch(`/users/search_suggestions?term=${encodeURIComponent(input)}&_=${new Date().getTime()}`, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
			"Authorization": localStorage.getItem("access_token") ? `Bearer ${token}` : null,
		}
	});
	const data = await response.json();
	if (!response.ok && response.status != 401) {
		console.error(`Error getting suggestions: ${data.message}`);
		localStorage.setItem('access_token', data.access_token);
		return ;
	}
	else if (!response.ok && response.status == 401) {
		alert("As your session has expired, you will be logged out.");
		history.pushState(null, '', `/`);
		htmx.ajax('GET', `/`, {
			target: '#main'
		});
		return;
	} else {
		localStorage.setItem('access_token', data.access_token);
	}

	suggestionsBox.innerHTML = ''; 
	suggestionsBox.style.display = data.length ? 'block' : 'none'; 

	data.forEach(user => {
		console.log(user);
		const userBlock = document.createElement('div');
		userBlock.classList.add('user-block');
		userBlock.classList.add('d-flex');
		userBlock.classList.add('align-items-center');
		userBlock.id = 'search-user';

		const link = document.createElement('a');
		link.style.display = 'block'; 

		const username = document.createElement('h4');
		username.classList.add('suggestion-name');
		username.textContent = user.username;

		userBlock.onclick = function() {
			history.pushState(null, '', `/users/${user.id}`);
			htmx.ajax('GET', `/users/${user.id}`, {
				target: '#main'  
			});
		};
		const pic = document.createElement('img');
		pic.classList.add('suggestion-pic');
		if (user.picture.includes("http"))
			pic.src = decodeURIComponent(user.picture.slice(7));
		else
			pic.src = user.picture;
		pic.alt = `${user.username}'s profile picture`;

		userBlock.appendChild(pic);
		userBlock.appendChild(username);
		link.appendChild(userBlock);
		suggestionsBox.appendChild(link);
	});
}


