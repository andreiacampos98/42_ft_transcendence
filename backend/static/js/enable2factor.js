document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && !node["htmx-internal-data"]) {
              htmx.process(node)
            }
          })
        })
      });
    observer.observe(document, {childList: true, subtree: true});
})


async function toggle2FA() {
    const checkbox = document.getElementById('enable');
    const isChecked = checkbox.checked;
    let token = localStorage.getItem("access_token");
    console.log(isChecked)
    try {
        const userId = document.getElementById('enable').getAttribute('data-user-id');
        console.log(userId)
        const response = await fetch(`/toggle-2fa/${userId}`, {
            method: 'POST',
            headers: {
              "Authorization": localStorage.getItem("access_token") ? `Bearer ${token}` : null,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ enabled: isChecked })
        });
        
        const data = await response.json();
        console.log(data.message); 
        if (!response.ok && response.status != 401) {
            throw new Error('There was an issue updating the status of 2FA');
        }
        else if (response.status == 401) {
          alert("As your session has expired, you will be logged out.");
          history.pushState(null, '', `/`);
          htmx.ajax('GET', `/`, {
            target: '#main'
          });
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('There was an issue changing the status of 2FA.');
    }
}

