function onSignout() {   
    fetch(`/signout/`, {
        method: "POST",
        headers: {
            "Authorization": localStorage.getItem("access_token") ? `Bearer ${localStorage.getItem("access_token")}` : null,
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        if (JSON.stringify(data.data) === '{}') {
            alert(data.message); 
        } else {
            localStorage.removeItem("access_token");
            history.pushState(null, '', '/');
            htmx.ajax('GET', `/`, {
                target: '#main'  
            });
        }
    })
    .catch(error => console.error('Error:', error));
}
