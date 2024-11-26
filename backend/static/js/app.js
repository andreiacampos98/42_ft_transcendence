var currRoute = '';
var lastRoute = '';

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
			console.log('Current route: ', key);
			route = key;
			// appendScripts(key);
			return false;
		}
		return true;
	});

	if (!route)
		return ;

	console.log('ROUTE ', route)
	console.log('SCRIPTS ', routeScripts[route])

	routeScripts[route].forEach(file => {		
		let script = document.createElement('script');
		script.src = file.startsWith('https') ? file : `/static/js/${file}.js`;
		document.body.appendChild(script);
	});
};

const mutationsCallback = (mutations) => {
	localStorage.removeItem('htmx-history-cache')
	// Ignore second set of mutations
	console.log(lastRoute, currRoute, window.location.pathname)
	if (currRoute == window.location.pathname)
		return ;
	
	lastRoute = currRoute;
	currRoute = window.location.pathname;

	if (currRoute.startsWith('/tournaments/ongoing/'))
		myTournament.updateUI({isPhaseOver: false});
	// else if (currRoute.startsWith('/tournaments/ongoing/') && lastRoute.startsWith('/gametournament'))
	// 	return ;
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

// Detecs navigation to inject the JS scripts linked to that route
window.addEventListener('DOMContentLoaded', (event) => {
	observeHTML();
	mutationsCallback();
});

//Handles attempts from a player to navigate away from an ongoing tournament
window.addEventListener('htmx:beforeRequest', (event) => {
	let nextRoute = event.detail.pathInfo.finalPath;
	if (myUser.attemptedToLeaveTournament(currRoute, nextRoute))
		handleTournamentLeave(event);
	else if (myUser.attemptedToLeaveRemoteGame(currRoute, nextRoute))
		myUser.disconnectSocket('gameSocket');
});


window.addEventListener('popstate', (event) => {
	console.log("event");
    const currentUrl = window.location.pathname;

    if (currRoute !== currentUrl) {
        currRoute = currentUrl;

        htmx.ajax('GET', currentUrl, {
            target: '#main',
			swap: 'innerHTML'
        }).then(() => {
            appendScripts();
        });
    }
});

//! ============================ GLOBAL VARIABLES ============================

let charts = {
	'donut': null,
	'bar-line': null,
	'line': null
};
