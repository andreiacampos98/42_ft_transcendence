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
    // const statusMessage = document.getElementById('message');
    
    const isChecked = checkbox.checked;
    // statusMessage.textContent = isChecked ? "Disable 2FA" : "Enable 2FA";
    console.log(isChecked)
    try {
        const userId = document.getElementById('enable').getAttribute('data-user-id');
        console.log(userId)
        const response = await fetch(`/toggle-2fa/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ enabled: isChecked })
        });

        if (!response.ok) {
            throw new Error('There was an issue updating the status of 2FA');
        }

        const data = await response.json();
        console.log(data.message); 
    } catch (error) {
        console.error('Erro:', error);
        alert('There was an issue changing the status of 2FA.');
    }
}

