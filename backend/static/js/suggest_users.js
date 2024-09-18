function getSuggestions() {
    var input = document.getElementById('search').value;
    var suggestionsBox = document.getElementById('suggestions');

    if (input.length > 2) { // Trigger suggestions after 2 characters
        fetch(`/users/search_suggestions?term=${encodeURIComponent(input)}&_=${new Date().getTime()}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
        .then(response => response.json())
        .then(data => {
            suggestionsBox.innerHTML = ''; // Clear previous suggestions
            suggestionsBox.style.display = 'block'; // Ensure suggestions are visible
            if (data.length > 0) {
                data.forEach(user => {
                    const userBlock = document.createElement('div');
                    userBlock.classList.add('user-block');
                    userBlock.id = 'search-user';

                    const link = document.createElement('a');
                    // link.setAttribute('hx-get', `/users/${user.username}`);
                    // link.setAttribute('hx-target', '#main'); 
                    // link.setAttribute('hx-push-url', 'true');
                    // link.setAttribute('hx-trigger', 'click');
                    link.style.display = 'block'; 

                    const username = document.createElement('h4');
                    username.textContent = user.username;

                    userBlock.onclick = function() {
                        history.pushState(null, '', `/users/${user.id}`);
                        htmx.ajax('GET', `/users/${user.id}`, {
                            target: '#main'  
                        });
                    };

                    userBlock.appendChild(username);
                    link.appendChild(userBlock);
                    suggestionsBox.appendChild(link);
                });
            } else {
                suggestionsBox.style.display = 'none'; // Hide suggestions if none
            }
        })
        .catch(error => console.error('Error fetching suggestions:', error));
    } else {
        suggestionsBox.innerHTML = ''; // Clear suggestions if input is short
        suggestionsBox.style.display = 'none'; // Hide suggestions
    }
}


