function getChangePassword()
{
    const userId = document.querySelector('button[onclick="getNotifications()"]').getAttribute('data-user-id');

    fetch(`users/${userId}/password`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            window.location.href = `/profile/${data.username}`; // Atualiza a página para refletir as alterações
        }
    })
    .catch(error => console.error('Error:', error));
}