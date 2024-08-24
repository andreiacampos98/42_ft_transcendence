// script.js

const players = [
    { id: 1, name: 'Player 1', score: 0, icon: 'icon1.png' },
    { id: 2, name: 'Player 2', score: 0, icon: 'icon2.png' },
    { id: 3, name: 'Player 3', score: 0, icon: 'icon3.png' },
    { id: 4, name: 'Player 4', score: 0, icon: 'icon4.png' },
];

let semiFinals = { winner1: null, winner2: null };
let finalWinner = null;

function advancePlayer(playerId) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // Increase the player's score
    player.score += 1;

    // Update the player's score in the HTML
    document.getElementById(`player${playerId}`).querySelector('.score').innerText = player.score;

    // Check if the player should advance to the next round
    if (player.score === 1) {
        if (playerId === 1 || playerId === 2) {
            semiFinals.winner1 = player;
            updateRound2Player('semi1', player);
        } else if (playerId === 3 || playerId === 4) {
            semiFinals.winner2 = player;
            updateRound2Player('semi2', player);
        }

        // Update lines
        document.querySelector(`#player${playerId} ~ .line`).style.backgroundColor = 'white';
    } else if (player.score === 2) {
        if (playerId === semiFinals.winner1.id) {
            finalWinner = semiFinals.winner1;
            updateRound3Player('final', finalWinner);
        } else if (playerId === semiFinals.winner2.id) {
            finalWinner = semiFinals.winner2;
            updateRound3Player('final', finalWinner);
        }

        // Update lines
        document.querySelector(`#semi1 ~ .line`).style.backgroundColor = 'white';
        document.querySelector(`#semi2 ~ .line`).style.backgroundColor = 'white';
    }
}

function updateRound2Player(elementId, player) {
    const element = document.getElementById(elementId);
    element.querySelector('.name').innerText = player.name;
    element.querySelector('.score').innerText = player.score;
    element.querySelector('.icon').src = player.icon;
}

function updateRound3Player(elementId, player) {
    const element = document.getElementById(elementId);
    element.querySelector('.name').innerText = player.name;
    element.querySelector('.score').innerText = player.score;
    element.querySelector('.icon').src = player.icon;

    // Highlight the final winner
    element.style.borderColor = '#28a745';
    element.style.backgroundColor = '#d4edda';
}