function getSuggestions() {
    var input = document.getElementById('search').value;
    var suggestionsBox = document.getElementById('suggestions');

    if (input.length > 2) { // Requisição após 2 caracteres
        fetch(`/suggest_users/?term=${input}`)
            .then(response => response.json())
            .then(data => {
                suggestionsBox.innerHTML = ''; // Limpa sugestões anteriores
                data.forEach(user => {
                    var div = document.createElement('div');
                    div.textContent = user;
                    div.style.padding = '8px';
                    div.style.cursor = 'pointer';
                    div.onclick = function() {
                        document.getElementById('search').value = user;
                        suggestionsBox.innerHTML = '';
                    };
                    suggestionsBox.appendChild(div);
                });
            });
    } else {
        suggestionsBox.innerHTML = ''; // Limpa sugestões se o input for curto
    }
}