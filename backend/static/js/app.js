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
        fetch(route)
            .then(response => response.text())
            .then(html => {
                app.innerHTML = html;
                if (window.history.pushState) {
                    window.history.pushState(null, '', path);
                }
            });
    }
};

window.addEventListener('popstate', () => {
    navigateTo(window.location.pathname);
});
