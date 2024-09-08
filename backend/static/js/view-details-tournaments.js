// function detailTournamentGames(button) {
//     const tournament_id = button.getAttribute('data-tournament-id');
//     const detailsDiv = document.getElementById('details-' + tournament_id);

//     if (detailsDiv.style.display === 'none' || detailsDiv.style.display === '') {
//         // Mostrar os detalhes
        
//         // Fetch para buscar os dados dos jogos do torneio
//         fetch(`/tournaments/${tournament_id}/games`, {
//             headers: {
//                 'X-Requested-With': 'XMLHttpRequest'
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             const gameList = detailsDiv;
//             gameList.innerHTML = ''; // Limpar o conteúdo anterior
            
//             data.forEach(game => {
//                 const line = document.createElement('div');
//                 line.classList.add('match-container');
                
//                 line.innerHTML = `
//                 <div class="match-block pingpong victory">
//                     <div class="icon">
//                         <img src="/static/assets/icons/pong.png" alt="Pingpong Icon">
//                     </div>
//                     <div class="details">
//                         <span class="date">${new Date(game.created_at).toLocaleString()}</span>
//                         <span class="result">${game.nb_goals_user1} - ${game.nb_goals_user2}</span>
//                     </div>
//                     <div class="opponent">
//                         <a href="/user/${game.winner_id.id}">
//                             <img src="${game.winner_id.picture.url}" alt="Opponent Icon">
//                             <span class="score">${game.winner_id.username}</span>
//                         </a>
//                     </div>
//                 </div>
//                 `;
                
//                 gameList.appendChild(line);
//             });
//             detailsDiv.style.display = 'block';
//             button.textContent = 'Esconder detalhes';
//             // gameList.style.display = 'block';
//         })
//         .catch(error => {
//             console.error('Erro ao buscar jogos:', error);
//         });
//     } else {
//         // Esconder os detalhes
//         detailsDiv.style.display = 'none';
//         button.textContent = 'Ver detalhes';
//     }
// }
