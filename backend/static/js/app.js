var currRoute = '';
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
const moduleScripts = ['profile'];


const appendScripts = (route) => {
	routeScripts[route].forEach(file => {
		const body = document.getElementById('main');
		let script = document.createElement('script');

		script.type = moduleScripts.includes(file) ? 'module' : '';
		if (file.startsWith('https'))
			script.src = file;
		else
			script.src = `/static/js/${file}.js`; 
		console.log(script.src);
		body.appendChild(script);
		// previousRouteScripts.push(script);
	});
};

const callback = (mutations) => {
	// Ignore second set of mutations
	if (currRoute == window.location.pathname)
		return ;
	
	currRoute = window.location.pathname;

	// previousRouteScripts.forEach(script => {
	// 	console.log('Removing: ', script.src);
	// 	script.remove();
	// });

	Object.keys(routeScripts).forEach(key => {
		if (currRoute.startsWith(key)) {
			appendScripts(key);
		}
	});
}

const observeHTML = () => {
	const targetNode = document.getElementById('main');
	const config = { 'childList': true };
	
	const observer = new MutationObserver(callback);
	observer.observe(targetNode, config);
};

window.addEventListener('DOMContentLoaded', (event) => observeHTML());
