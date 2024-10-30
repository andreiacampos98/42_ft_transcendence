async function getSuggestions() {
    var input = document.getElementById('search').value;
    var suggestionsBox = document.getElementById('suggestions');

    if (!input.length) { // Trigger suggestions after 2 characters
        suggestionsBox.innerHTML = ''; // Clear suggestions if input is short
        suggestionsBox.style.display = 'none'; // Hide suggestions
		return ;
    }
	const response = await fetch(`/users/search_suggestions?term=${encodeURIComponent(input)}&_=${new Date().getTime()}`, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
		}
	});
	const data = await response.json();
	if (!response.ok) {
		console.error(`Error fetching suggestions: ${data.message}`);
		return ;
	}
	suggestionsBox.innerHTML = ''; // Clear previous suggestions
	suggestionsBox.style.display = data.length ? 'block' : 'none'; // Hide suggestions if none

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


