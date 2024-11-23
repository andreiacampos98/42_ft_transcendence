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
	gameList.replaceChildren(); 

	const headerDiv = document.createElement('div');
	headerDiv.classList.add('header2', 'd-flex', 'align-items-center', 'justify-content-evenly');
	
	const headers = ["", "Phase", "Duration", "Player 1", "Score", "Player 2"];
	const widths = ["100px", null, null, null, null, null]; // Defina as larguras conforme necessário
	headers.forEach((headerText, index) => {
		const span = document.createElement('span');
		span.classList.add('title');
		if (widths[index]) span.style.width = widths[index];
		span.textContent = headerText;
		headerDiv.appendChild(span);
	});
	
	gameList.appendChild(headerDiv);

	data.games.forEach(game => {
		const gameBlock = document.createElement('div');
		gameBlock.classList.add('match-container2');
		gameBlock.id = `game-${game.game.id}`;
	
		const matchBlock2 = document.createElement('div');
		matchBlock2.classList.add('match-block2', 'd-flex', 'align-items-center');
	
		const details = document.createElement('div');
		details.classList.add('details', 'd-flex', 'align-items-center', 'justify-content-evenly');
	
		const phase = document.createElement('span');
		phase.classList.add('content', 'result');
		phase.style.marginLeft = "50px";
		phase.textContent = game.phase;
	
		const duration = document.createElement('span');
		duration.classList.add('content', 'date');
		duration.textContent = game.game.duration;
	
		const createUserLink = (user, scoreClass) => {
			const userLink = document.createElement('a');
			userLink.href = `/users/${user.id}`;
			userLink.classList.add('user-link');
	
			// Imagem do usuário
			const userProfilePic = document.createElement('img');
			userProfilePic.classList.add('profile-pic');
			userProfilePic.alt = `${user.username}'s profile picture`;
			userProfilePic.src = user.picture.includes('http') 
				? `https://${decodeURIComponent(user.picture).slice(14)}`
				: user.picture;
	
			// Nome do usuário
			const userName = document.createElement('span');
			userName.classList.add('score');
			if (scoreClass) userName.classList.add(scoreClass);
			userName.textContent = user.username;
	
			// Adicionar a imagem e o nome como filhos do hyperlink
			userLink.appendChild(userProfilePic);
			userLink.appendChild(userName);
	
			return userLink;
		};
	
		const score = document.createElement('span');
		score.classList.add('content', 'last');
		score.style.fontWeight = "bold";
		score.style.paddingRight = "0";
		score.textContent = `${game.game.nb_goals_user1} - ${game.game.nb_goals_user2}`;
	
		// Criando links com imagem e nome para os jogadores
		const user1LinkElement = createUserLink(
			game.game.user1,
			game.game.nb_goals_user1 > game.game.nb_goals_user2 ? 'tour-game-winner' : null
		);
	
		const user2LinkElement = createUserLink(
			game.game.user2,
			game.game.nb_goals_user2 > game.game.nb_goals_user1 ? 'tour-game-winner' : null
		);
	
		// Adicionando links ao layout
		const player1Span = document.createElement('span');
		player1Span.classList.add('content', 'last');
		player1Span.style.fontSize = "inherit";
		player1Span.style.paddingRight = "0";
		player1Span.appendChild(user1LinkElement); // Append do elemento retornado
	
		const player2Span = document.createElement('span');
		player2Span.classList.add('content', 'last');
		player2Span.style.fontSize = "inherit";
		player2Span.style.paddingRight = "0";
		player2Span.appendChild(user2LinkElement); // Append do elemento retornado
	
		details.appendChild(phase);
		details.appendChild(duration);
		details.appendChild(player1Span);
		details.appendChild(score);
		details.appendChild(player2Span);
	
		matchBlock2.appendChild(details);
		gameBlock.appendChild(matchBlock2);
	
		// Adicionar link de detalhes do jogo
		const gameDetailLink = document.createElement('a');
		gameDetailLink.href = `/games/${game.game.id}/stats`;
		gameDetailLink.classList.add('game-link');
		gameDetailLink.appendChild(gameBlock);
	
		gameList.appendChild(gameDetailLink);
	});	
	detailsDiv.style.display = 'flex';
	imgElement.src = "/static/assets/icons/return.png";
}
