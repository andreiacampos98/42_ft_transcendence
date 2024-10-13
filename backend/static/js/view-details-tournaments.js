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
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const gameList = detailsDiv;
            gameList.innerHTML = '';
            
            data.forEach(game => {
                const gameBlock = document.createElement('div');
                gameBlock.classList.add('match-container');
                gameBlock.id = `game-${game.game.id}`; 

                const user1Link = document.createElement('a');
                user1Link.href = `/users/${game.game.user1.id}`;
                user1Link.classList.add('user-link');

                const user1ProfilePic = document.createElement('img');
                user1ProfilePic.classList.add('profile-pic');
                if (game.game.user1.picture.includes('http')) {
                    user1ProfilePic.src = decodeURIComponent(game.game.user1.picture.slice(7));
                } else {
                    user1ProfilePic.src = game.game.user1.picture; 
                }
                user1ProfilePic.alt = `${game.game.user1.username}'s profile picture`;

                const user1Name = document.createElement('span');
                user1Name.classList.add('score');
                user1Name.textContent = game.game.user1.username;

                user1Link.appendChild(user1ProfilePic);
                user1Link.appendChild(user1Name);

                // Create link for the second user
                const user2Link = document.createElement('a');
                user2Link.href = `/users/${game.game.user2.id}`;
                user2Link.classList.add('user-link');

                const user2ProfilePic = document.createElement('img');
                user2ProfilePic.classList.add('profile-pic');
                if (game.game.user2.picture.includes('http')) {
                    user2ProfilePic.src = decodeURIComponent(game.game.user2.picture.slice(7));
                } else {
                    user2ProfilePic.src = game.game.user2.picture; 
                }
                user2ProfilePic.alt = `${game.game.user2.username}'s profile picture`;

                const user2Name = document.createElement('span');
                user2Name.classList.add('score');
                user2Name.textContent = game.game.user2.username;

                user2Link.appendChild(user2ProfilePic);
                user2Link.appendChild(user2Name);
                

                gameBlock.innerHTML = `
                    <div class="match-block d-flex align-items-center pingpong victory">
                        <div class="details d-flex align-items-center justify-content-evenly">
                            <span class="result">${game.phase}</span>
                            <span class="date">${game.game.duration}</span>
                            ${user1Link.outerHTML}
                            <span class="result">${game.game.nb_goals_user1} - ${game.game.nb_goals_user2}</span>
                            ${user2Link.outerHTML}
                        </div>
                    </div>
                `;

                gameList.appendChild(gameBlock); 
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
