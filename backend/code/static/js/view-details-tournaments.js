async function detailTournamentGames(button) {

    const tournament_id = button.getAttribute('data-tournament-id');
    const detailsDiv = document.getElementById('details-' + tournament_id);
    const imgElement = button.querySelector('img');

    const buttonParentDiv = button.closest('div.details');
    const grandParentDiv = buttonParentDiv.closest('div.match-block');
    grandParentDiv.classList.add("enlarged2");
    buttonParentDiv.classList.add("enlarged");
    if (detailsDiv.style.display != 'none' && detailsDiv.style.display != '') {
        detailsDiv.style.display = 'none';
        imgElement.src = "/static/assets/icons/Collapse-Arrow.png";
        grandParentDiv.classList.toggle("enlarged2");
        buttonParentDiv.classList.toggle("enlarged");
		return;
	} 

	let token = localStorage.getItem("access_token");
	const response = await fetch(`/tournaments/${tournament_id}/games`, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
			"Authorization": localStorage.getItem("access_token") ? `Bearer ${token}` : null,
		}
	});
	const data = await response.json();
	if (!response.ok && response.status != 401) {
		localStorage.setItem('access_token', data.access_token);
		console.error(data.message);
		return ;
	}
	else if (!response.ok && response.status == 401) {
		alert("As your session has expired, you will be logged out.");
		history.pushState(null, '', `/`);
		htmx.ajax('GET', `/`, {
			target: '#main'
		});
	} else {
		localStorage.setItem('access_token', data.access_token);
	}
	const gameList = detailsDiv;
	gameList.innerHTML = `
	<div class="header2 d-flex align-items-center justify-content-evenly">
			<span class="title" style="width: 100px;"></span>
			<span class="title">Phase</span>
			<span class="title">Duration</span>
			<span class="title">Player 1</span>
			<span class="title">Score</span>
			<span class="title">Player 2</span>
		</div>
		`;
	
	data.games.forEach(game => {
		const gameBlock = document.createElement('div');
		gameBlock.classList.add('match-container2');
		gameBlock.id = `game-${game.game.id}`; 

		const user1Link = document.createElement('a');
		user1Link.href = `/users/${game.game.user1.id}`;
		user1Link.classList.add('user-link');

		const user1ProfilePic = document.createElement('img');
		user1ProfilePic.classList.add('profile-pic');
		user1ProfilePic.alt = `${game.game.user1.username}'s profile picture`;

		if (game.game.user1.picture.includes('http')) 
			user1ProfilePic.src = decodeURIComponent(game.game.user1.picture.slice(7));
		else 
			user1ProfilePic.src = game.game.user1.picture; 
		
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
		user2ProfilePic.alt = `${game.game.user2.username}'s profile picture`;

		if (game.game.user2.picture.includes('http')) 
			user2ProfilePic.src = decodeURIComponent(game.game.user2.picture.slice(7));
		else 
			user2ProfilePic.src = game.game.user2.picture; 

		const user2Name = document.createElement('span');
		user2Name.classList.add('score');
		user2Name.textContent = game.game.user2.username;

		user2Link.appendChild(user2ProfilePic);
		user2Link.appendChild(user2Name);
		if ( game.game.nb_goals_user1 > game.game.nb_goals_user2) 
			user1Name.classList.add('tour-game-winner');
		else 
			user2Name.classList.add('tour-game-winner');
		
		const gameDetailLink = document.createElement('a');
		gameDetailLink.href = `/games/${game.game.id}/stats`;
		gameDetailLink.classList.add('game-link'); 

		gameBlock.innerHTML = `
			<div class="match-block2 d-flex align-items-center">
				<div class="details d-flex align-items-center justify-content-evenly">
					<span class="content result" style="margin-left: 50px;" >${game.phase}</span>
					<span class="content date">${game.game.duration}</span>
					<span class="content last" style="font-size: inherit; padding-right: 0;">${user1Link.outerHTML}</span>
					<span class="content last" style="font-weight: bold; padding-right: 0;">${game.game.nb_goals_user1} - ${game.game.nb_goals_user2}</span>
					<span class="content last" style="font-size: inherit; padding-right: 0;">${user2Link.outerHTML}</span>
				</div>
			</div>
		`;

		gameDetailLink.appendChild(gameBlock);
		gameList.appendChild(gameDetailLink); 
	});
	detailsDiv.style.display = 'flex';
	imgElement.src = "/static/assets/icons/return.png";
}
