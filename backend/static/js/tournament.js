function initModal(){
	let modal = document.getElementById("modal2");
	let createTournamentButton = document.getElementById("tournament-creater");
	let goBackButton = document.getElementById("cancel-create-tournament");

	createTournamentButton.onclick = () => modal.style.display = "block";
	goBackButton.onclick = () => modal.style.display = "none";
	window.onclick = (event) => {
		if (event.target == modal)
			modal.style.display = "none";
	}

	let checkbox = document.getElementById('use-username-checkbox');
	let nicknameInput = document.getElementById('nickname-input-create');

	checkbox.addEventListener('change', function() {
		if (this.checked) {
			nicknameInput.disabled = true;  
			nicknameInput.placeholder = "Using username";
		} else {
			nicknameInput.disabled = false; 
			nicknameInput.placeholder = "Insert your nickname here";
		}
	});
};

function initCreateTournamentButton(){
	const createTournamentButton = document.getElementById('tournament-creater');
	createTournamentButton.onmouseenter = function () {
		document.getElementById('plus-icon').src = "/static/assets/icons/plus-hover.png";
	}
	createTournamentButton.onmouseleave = function () {
		document.getElementById('plus-icon').src = "/static/assets/icons/plus.png";
	}
};

function onCreateButtonClick()
{
	const userId = document.querySelector('button[onclick="onCreateButtonClick()"]').getAttribute('data-user-id');
	const checkbox = document.getElementById('use-username-checkbox');
	var alias;

	if (checkbox.checked)
		alias = document.getElementById("nickname-input-create").getAttribute('data-user-username');
	else 
		alias = document.getElementById("nickname-input-create").value;
	
	var formData = {
		"name": document.getElementById("new-tournament-name").value,
		"capacity":  document.getElementById("numPlayers").value,
		"host_id": userId,
		"alias": alias,
		"status": 'Open'
	};
	console.log(formData)

	fetch(`/tournaments/create`, {
		method: "POST",
		body: JSON.stringify(formData),
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
		}
	})
	.then(response => response.json())
	.then(data => {
		if (JSON.stringify(data.data) === '{}') {
			alert(data.message);
		} else {
			alert("Tournament created successfully!");
			const tournamentId = data.data.id; // Ajuste conforme o formato da resposta
			console.log(data.data);
			user.tournamentAlias = formData.alias;
			user.tournamentID = tournamentId;
			history.pushState(null, '', `/tournaments/ongoing/${tournamentId}`);
			htmx.ajax('GET', `/tournaments/ongoing/${tournamentId}`, {
				target: '#main' , 
			});
		}
	})
	.catch(error => console.error('Error:', error));
}

initModal();
initCreateTournamentButton();
