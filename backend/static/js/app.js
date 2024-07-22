document.addEventListener('DOMContentLoaded', () => {
    navigateTo(window.location.pathname);
});

const navigateTo = (path) => {
    fetch(path)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('Network response was not ok.');
        })
        .then(html => {
            document.getElementById('MainPage').innerHTML = html;
            if (window.history.pushState) {
                window.history.pushState(null, '', path);
            }
        })
        .catch(error => console.error('There was a problem with the fetch operation:', error));
};

window.addEventListener('popstate', () => {
    navigateTo(window.location.pathname);
});
