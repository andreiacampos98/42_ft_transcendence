function getNotifications() {
    // Get the user_id from the button's data attribute
    const userId = document.querySelector('button[onclick="getNotifications()"]').getAttribute('data-user-id');

    fetch(`/notifications/${userId}`, {  // Modify this URL according to your notifications endpoint
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        const notificationList = document.getElementById('notificationList');
        notificationList.innerHTML = '';  // Clear existing notifications

        data.forEach(notification => {
            const listItem = document.createElement('li');
            
            // Create user picture element
            const profilePic = document.createElement('img');
            profilePic.classList.add('profile-pic');
            profilePic.src = notification.other_user_id.picture;
            profilePic.alt = `${notification.other_user_id.username}'s profile picture`;

            // Create text content with link to user profile
            const textContent = document.createElement('span');
            const profileLink = document.createElement('a');
            profileLink.href = `/profile/${notification.other_user_id.username}`;  // Assuming you have a profile URL pattern
            profileLink.textContent = notification.other_user_id.username;
            profileLink.classList.add('profile-link');

            textContent.appendChild(profileLink);
            textContent.appendChild(document.createTextNode(`${notification.description}`));

            // Create timestamp element
            const timestamp = document.createElement('span');
            timestamp.classList.add('timestamp');
            timestamp.textContent = new Date(notification.created_at).toLocaleString();

            listItem.appendChild(profilePic);
            listItem.appendChild(textContent);
            listItem.appendChild(timestamp);

            if (notification.status === 'Pending') {
                const acceptButton = document.createElement('button');
                acceptButton.textContent = 'Accept';
                acceptButton.onclick = () => handleNotificationAction(notification.id, 'accept');

                const declineButton = document.createElement('button');
                declineButton.textContent = 'Decline';
                declineButton.onclick = () => handleNotificationAction(notification.id, 'decline');

                listItem.appendChild(acceptButton);
                listItem.appendChild(declineButton);
            }

            notificationList.appendChild(listItem);

        });

        // Display the modal
        const modal = document.getElementById('notificationModal');
        modal.style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching notifications:', error);
    });
}

function closeModal() {
    const modal = document.getElementById('notificationModal');
    modal.style.display = 'none';
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
    const modal = document.getElementById('notificationModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}