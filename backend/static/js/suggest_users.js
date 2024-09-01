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
                    var div = document.createElement('div');
                    div.textContent = user.username;
                    div.style.padding = '8px';
                    div.style.cursor = 'pointer';
                    div.onclick = function() {
                        window.location.href = `/users/${user.username}`;
                    };
                    suggestionsBox.appendChild(div);
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


