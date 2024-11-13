var currRoute = '';
var lastRoute = '';

const routeScripts = {
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
	'/tournaments/ongoing/': ['ongoing-tourn'],
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
	if (window.location.pathname.startsWith('/tournaments/ongoing/'))
		tournament.updateUI();
	// Ignore second set of mutations
	if (currRoute == window.location.pathname || lastRoute.startsWith('/tournaments/ongoing/'))
		return ;
	
	lastRoute = currRoute;
	currRoute = window.location.pathname;
	
	Object.keys(routeScripts).forEach(key => {
		if (currRoute.startsWith(key)) {
			console.log('Current route: ', key);
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


