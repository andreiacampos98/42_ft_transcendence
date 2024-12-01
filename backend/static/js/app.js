var currRoute = '', lastRoute = '';

const routeScripts = {
	'/tournaments/ongoing/': ['ongoing-tourn'],
	'/tournaments/': ['tournament', 'join_tournament'],
	'/users/': [
		'https://cdn.jsdelivr.net/npm/apexcharts',
		'profile', 
		'edit-profile', 
		'change-password', 
		'friends-add-remove', 
		'tab-recent-matches', 
		'view-details-tournaments',
		'enable2factor'
	],
};

const appendScripts = () => {
	let route = null;

	Object.keys(routeScripts).every(key => {
		if (currRoute.startsWith(key)) {
			route = key;
			return false;
		}
		return true;
	});

	if (!route)
		return ;

	routeScripts[route].forEach(file => {		
		let script = document.createElement('script');
		script.src = file.startsWith('https') ? file : `/static/js/${file}.js`;
		document.body.appendChild(script);
	});
};

const destroyChart = () => {
    if (charts["line"]) {
        charts["line"].destroy();
        charts["line"] = null; 
    }
	if (charts["donut"]) {
        charts["donut"].destroy();
        charts["donut"] = null; 
    }
	if (charts["bar-line"]) {
        charts["bar-line"].destroy();
        charts["bar-line"] = null; 
    }
};

const mutationsCallback = (mutations) => {
	localStorage.removeItem('htmx-history-cache')
	
	destroyChart();
	if (currRoute == window.location.pathname)
		return ;
	
	lastRoute = currRoute;
	currRoute = window.location.pathname;
	lastQuery = window.location.search;
	
	if (currRoute.startsWith('/tournaments/ongoing/'))
		myTournament.updateUI({isPhaseOver: false});
	
	appendScripts();
	
};

const observeHTML = () => {
	const targetNode = document.getElementById('main');
	const config = { 'childList': true };
	
	const observer = new MutationObserver(mutationsCallback);

	observer.observe(targetNode, config);
};

//! ============================ EVENT LISTENERS / HANDLERS ============================

const handleTournamentLeave = (event) => {
	event.preventDefault();
	if (!currRoute.startsWith('/gametournament'))
		document.getElementById('leave-tournament-button').click();
};

window.addEventListener('DOMContentLoaded', (event) => {
	observeHTML();
	mutationsCallback();
});

window.addEventListener('htmx:beforeRequest', (event) => {
	let nextRoute = event.detail.pathInfo.finalPath;
	if (myUser.attemptedToLeaveTournament(currRoute, nextRoute))
		handleTournamentLeave(event);
	else if (myUser.attemptedToLeaveRemoteGame(currRoute, nextRoute))
		myUser.disconnectSocket('gameSocket');
});

//! ============================ GLOBAL VARIABLES ============================

let charts = {
	'donut': null,
	'bar-line': null,
	'line': null
};
