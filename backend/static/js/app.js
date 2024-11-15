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
	],
};


const appendScripts = (route) => {
	routeScripts[route].forEach(file => {		
		let script = document.createElement('script');
		script.src = file.startsWith('https') ? file : `/static/js/${file}.js`;
		console.log(script.src);
		document.body.appendChild(script);
	});
};

const mutationsCallback = (mutations) => {
	// Ignore second set of mutations
	if (currRoute == window.location.pathname)
		return ;
	
	lastRoute = currRoute;
	currRoute = window.location.pathname;

	if (currRoute.startsWith('/tournaments/ongoing/'))
		myTournament.updateUI();
	// else if (currRoute.startsWith('/tournaments/ongoing/') && lastRoute.startsWith('/gametournament'))
	// 	return ;

	Object.keys(routeScripts).every(key => {
		if (currRoute.startsWith(key)) {
			console.log('Current route: ', key);
			appendScripts(key);
			return false;
		}
		return true;
	})
};

const observeHTML = () => {
	const targetNode = document.getElementById('main');
	const config = { 'childList': true };
	
	const observer = new MutationObserver(mutationsCallback);

	observer.observe(targetNode, config);
};

window.addEventListener('DOMContentLoaded', (event) => {
	observeHTML();
	mutationsCallback();
});

window.addEventListener('htmx:beforeRequest', (event) => {
	if (!myUser.isInTournament(currRoute))
		return ;
	event.preventDefault();
	document.getElementById('leave-tournament-button').click();
})


