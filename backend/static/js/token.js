async function checkTokenBeforeNavigation(event) {
    let token = localStorage.getItem("access_token");
    const response = await fetch(`/checktoken/`, {
        method: 'GET',
        headers: {
            "Authorization": token ? `Bearer ${token}` : "",
        }
    });

    if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
            localStorage.setItem("access_token", data.access_token);
        }
    } else {
        alert("Your session has expired. Redirecting to login.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        history.pushState(null, '', `/`);
        htmx.ajax('GET', `/`, {
            target: '#main'  
        });
    }
}
