// function getSuggestions() {
//     var input = document.getElementById('search').value;
//     var suggestionsBox = document.getElementById('suggestions');

//     if (input.length > 2) { // Request after 2 characters
//         fetch(`/users/search/?term=${input}&_=${new Date().getTime()}`, {
//             headers: {
//                 'X-Requested-With': 'XMLHttpRequest',
//                 'Cache-Control': 'no-cache',
//                 'Pragma': 'no-cache',
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             suggestionsBox.innerHTML = ''; // Clear previous suggestions
//             data.forEach(user => {
//                 var div = document.createElement('div');
//                 div.textContent = user.username; // Access the correct property
//                 div.style.padding = '8px';
//                 div.style.cursor = 'pointer';
//                 div.onclick = function() {
//                     window.location.href = `/profile/${user.username}/`;
//                 };
//                 suggestionsBox.appendChild(div);
//             });
//         });
//     } else {
//         suggestionsBox.innerHTML = ''; // Clear suggestions if input is short
//     }
// }

function getSuggestions() {
    var input = document.getElementById('search').value;
    var suggestionsBox = document.getElementById('suggestions');

    if (input.length > 2) { // Request after 2 characters
        fetch(`/users/search/?term=${encodeURIComponent(input)}&_=${new Date().getTime()}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            }
        })
        .then(response => response.json())
        .then(data => {
            suggestionsBox.innerHTML = ''; // Clear previous suggestions
            data.forEach(user => {
                var div = document.createElement('div');
                div.textContent = user.username; // Access the correct property
                div.style.padding = '8px';
                div.style.cursor = 'pointer';
                div.onclick = function() {
                    window.location.href = `/profile/${user.username}/`;
                };
                suggestionsBox.appendChild(div);
            });
        })
        .catch(error => console.error('Error fetching suggestions:', error));
    } else {
        suggestionsBox.innerHTML = ''; // Clear suggestions if input is short
    }
}

// Handle Enter key press
document.getElementById('search').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission
        var query = encodeURIComponent(this.value);
        if (query.length > 2) {
            window.location.href = `/users/search_results/?term=${query}`;
        }
    }
});