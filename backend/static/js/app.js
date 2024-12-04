var currRoute = '', lastRoute = '';
htmx.config.historyCacheSize = 0;

// const routeScripts = {
// 	'/users/': [
// 		'https://cdn.jsdelivr.net/npm/apexcharts',
// 	],
// };

// const loadApexCharts = () => {
// 	let script = document.createElement('script');
// 	script.src = 'https://cdn.jsdelivr.net/npm/apexcharts.js';
// 	script.defer = true;
// 	console.log(`Loaded ${script.src}`);
// 	document.body.appendChild(script);
// };


//! ============================ EVENT LISTENERS / HANDLERS ============================

const handleTournamentLeave = (event) => {
	event.preventDefault();
	if (!currRoute.startsWith('/gametournament'))
		document.getElementById('leave-tournament-button').click();
};

window.addEventListener('htmx:beforeRequest', (event) => {
	let nextRoute = event.detail.pathInfo.finalPath;
	if (myUser.attemptedToLeaveTournament(currRoute, nextRoute))
		handleTournamentLeave(event);
	else if (myUser.attemptedToLeaveRemoteGame(currRoute, nextRoute))
		myUser.disconnectSocket('gameSocket');
});


window.addEventListener('htmx:afterRequest', (event) => {
	lastRoute = currRoute;
	currRoute = event.detail.pathInfo.finalPath;

	if (currRoute.startsWith('/tournaments/ongoing/'))
		myTournament.updateUI({isPhaseOver: false});
});

window.addEventListener('popstate', (event) => {
	let nextRoute = window.location.pathname;

	if (!myUser.attemptedToLeaveTournament(currRoute, nextRoute))
		return ;
	if (confirm("You're about to leave the tournament. Are you sure?")) {
		myUser.leaveTournament();
    } else {
        history.pushState(null, null, currRoute);
		myTournament.updateUI({isPhaseOver: false});
    }
});