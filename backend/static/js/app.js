var currRoute = '';
console.log(currRoute);
var previousRouteScripts = [];
const routeScripts = {
	'/tournaments/': ['tournament', 'join_tournament'],
	'/users/': [
		'profile', 
		'edit-profile', 
		'change-password', 
		'friends-add-remove', 
		'tab-recent-matches', 
		'view-details-tournaments',
		'https://cdn.jsdelivr.net/npm/apexcharts'
	],
	'/tournaments/ongoing/': ['ongoing-tourn'],
	'/gamelocal/': ['game/main'],
	'/gameonline/': ['game/main'],
	'/gametournament/': ['game/main'],
};
const moduleScripts = ['game/main'];


const appendScripts = (route) => {
	console.log('Current route: ', route);
	routeScripts[route].forEach(file => {		
		let script = document.createElement('script');
		script.type = moduleScripts.includes(file) ? 'module' : '';
		script.src = file.startsWith('https') ? file : `/static/js/${file}.js`;
		console.log(script.src);
		document.body.appendChild(script);
	});
};

const mutationsCallback = (mutations) => {
	// Ignore second set of mutations
	if (currRoute == window.location.pathname)
		return ;
	
	currRoute = window.location.pathname;
	
	Object.keys(routeScripts).forEach(key => {
		if (currRoute.startsWith(key)) {
			appendScripts(key);
		}
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
