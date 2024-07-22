document.addEventListener('DOMContentLoaded', () => {
    navigateTo(window.location.pathname);
});

const app = document.getElementById('main');

const routes = {
    '/': '/pages/login.html',
    '/home': '/pages/home.html',
    '/tournaments': '/pages/tournaments.html',
    '/profile': '/pages/profile.html',
    '/signup': '/pages/signup.html',
    '/password_reset': '/pages/password_reset.html',
    '/logout': '/pages/login.html',
};

const navigateTo = (path) => {
    const route = routes[path];
    if (route) {
        app.setAttribute('hx-get', route);
        app.setAttribute('hx-target', 'this');
        app.setAttribute('hx-push-url', 'true');
        app.setAttribute('hx-swap', 'innerHTML');
        app.click(); // Trigger the request
    }
};

window.addEventListener('popstate', () => {
    navigateTo(window.location.pathname);
});
