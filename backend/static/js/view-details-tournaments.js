document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && !node["htmx-internal-data"]) {
              htmx.process(node)
            }
          })
        })
      });
    observer.observe(document, {childList: true, subtree: true});
})


function detailTournamentGames(button) {
    const tournament_id = button.getAttribute('data-tournament-id');
    const detailsDiv = document.getElementById('details-' + tournament_id);

    if (detailsDiv.style.display === 'none' || detailsDiv.style.display === '') {
        fetch(`/tournaments/${tournament_id}/games`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            const gameList = detailsDiv;
            gameList.innerHTML = '';
            
            data.forEach(game => {
                const line = document.createElement('div');
                line.classList.add('match-container');
                
                line.innerHTML = `
                <div id="match-container">
                    <div class="match-block d-flex align-items-center pingpong victory">
                        <div class="icon">
                            <img src="/static/assets/icons/pong.png" alt="Pingpong Icon">
                        </div>
                        <div class="details d-flex align-items-center justify-content-evenly">
                            <span class="date">${new Date(game.game.created_at).toLocaleString()}</span>
                            <span class="result">${game.game.nb_goals_user1} - ${game.game.nb_goals_user2}</span>
                        </div>
                        <div class="opponent">
                            <a href="/users/${game.game.winner.id}">
                                <span class="score">${game.game.winner.username}</span>
                            </a>
                        </div>
                    </div>
                </div>
                `;
                
                gameList.appendChild(line);
            });
            detailsDiv.style.display = 'block';
        })
        .catch(error => {
            console.error('Erro ao buscar jogos:', error);
        });
    } else {
        detailsDiv.style.display = 'none';
    }
}
