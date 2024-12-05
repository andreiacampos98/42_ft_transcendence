myUser.connectSocket(
	'tournamentSocket', 
	`wss://${window.location.host}/wss/tournaments/${myUser.tournamentID}`, 
	(event) => {
		const message = JSON.parse(event.data);
		const { event: eventType, data } = message;

		if (eventType == 'PLAYER_JOINED')
			myTournament.onPlayerJoined(data);
		else if (eventType == 'PLAYER_LEFT')
			myTournament.onPlayerLeft(data);
		else if (eventType == 'PHASE_START')
			setTimeout(() => myTournament.onPhaseStart(data), 2100);
		else if (eventType == 'PHASE_END')
			setTimeout(() => myTournament.onPhaseEnd(data), 1100);
	}
);



var modal = document.getElementById("modal");
var btn = document.getElementById("leave-tournament-button");
var goback = document.getElementById("cancel");

if (btn)
	btn.onclick = () => modal.style.display = "block";
goback.onclick = () => modal.style.display = "none";
window.onclick = function(event) {
	if (event.target == modal)
		modal.style.display = "none";
}

document.getElementById('leaver').onclick = (event) => myUser.leaveTournament();