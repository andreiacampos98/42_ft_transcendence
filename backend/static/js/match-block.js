const matches = [
    { type: 'tournament', place: 3 , date: "08/02/1997", score: "1 - 7"},
    { type: 'tournament', place: 4 , date: "08/02/1997", score: "1 - 7"},
<<<<<<< HEAD:js/match-block.js
    { type: 'pingpong', result: 'victory', opponentIcon: '../assets/icons/user.png' , date: "08/02/1997", score: "1 - 7"},
    { type: 'pingpong', result: 'defeat', opponentIcon: '../assets/icons/user.png' , date: "08/02/1997", score: "1 - 7"}
=======
    { type: 'pingpong', result: 'victory', opponentIcon: "/static/assets/icons/user.png" , date: "08/02/1997", score: "1 - 7"},
    { type: 'pingpong', result: 'defeat', opponentIcon: "/static/assets/icons/user.png" , date: "08/02/1997", score: "1 - 7"}
>>>>>>> feat/django:backend/static/js/match-block.js
];

const matchContainer = document.getElementById('match-container');

matches.forEach(match => {
    const matchBlock = document.createElement('div');
    matchBlock.classList.add('match-block');
    
    if (match.type === 'tournament') {
        matchBlock.classList.add('tournament');
        const placeClass = match.place <= 3 ? 'third-place' : 'below-third-place';
        matchBlock.classList.add(placeClass);

        matchBlock.innerHTML = `
            <div class="icon">
<<<<<<< HEAD:js/match-block.js
                <img src="../assets/icons/tournament.png" alt="Tournament Icon">
=======
                <img src="/static/assets/icons/tournament.png" alt="Tournament Icon">
>>>>>>> feat/django:backend/static/js/match-block.js
            </div>
            <div class="details">
                <span class="date">${match.date}</span>
                <span class="result">${match.place} Place</span>
                <span class="score">${match.score}</span>
            </div>
        `;
    } else if (match.type === 'pingpong') {
        matchBlock.classList.add('pingpong');
        matchBlock.classList.add(match.result);

        matchBlock.innerHTML = `
            <div class="icon">
<<<<<<< HEAD:js/match-block.js
                <img src="../assets/icons/pingpong.png" alt="Pingpong Icon">
=======
                <img src="/static/assets/icons/pingpong.png" alt="Pingpong Icon">
>>>>>>> feat/django:backend/static/js/match-block.js
            </div>
            <div class="details">
                <span class="date">${match.date}</span>
                <span class="result">${match.result.charAt(0).toUpperCase() + match.result.slice(1)}</span>
                <span class="score">${match.score}</span>
            </div>
            <div class="opponent">
                <img src="${match.opponentIcon}" alt="Opponent Icon">
            </div>
        `;
    }

    matchContainer.appendChild(matchBlock);
});