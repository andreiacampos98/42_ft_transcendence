myUser.connectSocket(
	'tournamentSocket', 
	`wss://${window.location.host}/wss/tournaments/${myUser.tournamentID}`, 
	(event) => {
		const message = JSON.parse(event.data);
		const { event: eventType, data } = message;

		let timeoutID1 = undefined, timeoutID2 = undefined;
		if (eventType == 'PLAYER_JOINED')
			myTournament.onPlayerJoined(data);
		else if (eventType == 'PLAYER_LEFT')
			myTournament.onPlayerLeft(data);
		else if (eventType == 'PHASE_START')
			timeoutID1 = setTimeout(() => myTournament.onPhaseStart(data), 2100);
		else if (eventType == 'PHASE_END')
			timeoutID2 = setTimeout(() => myTournament.onPhaseEnd(data), 1100);
		else if (eventType == 'CANCEL_TOURNAMENT') {
			clearTimeout();
			clearTimeout();
			myTournament.onCancelTournament();
		}
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