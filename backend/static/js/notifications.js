function getNotifications() {
    const userId = document.querySelector('button[onclick="getNotifications()"]').getAttribute('data-user-id');

    fetch(`/notifications/${userId}`, {
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
            
            const profilePic = document.createElement('img');
            profilePic.classList.add('profile-pic');
            profilePic.src = notification.other_user_id.picture;
            profilePic.alt = `${notification.other_user_id.username}'s profile picture`;

            const textContent = document.createElement('span');
            textContent.innerHTML = `<a href="/profile/${notification.other_user_id.id}">${notification.other_user_id.username}</a>: ${notification.description}`;
            
            const timestamp = document.createElement('span');
            timestamp.classList.add('timestamp');
            timestamp.textContent = new Date(notification.created_at).toLocaleString();

            listItem.appendChild(profilePic);
            listItem.appendChild(textContent);
            listItem.appendChild(timestamp);

            if (notification.status === 'Pending') {
                const acceptButton = document.createElement('button');
                acceptButton.textContent = 'Accept';
                acceptButton.onclick = () => handleNotificationAction(notification.id, 'accept', userId, notification.other_user_id.id);

                const declineButton = document.createElement('button');
                declineButton.textContent = 'Decline';
                declineButton.onclick = () => handleNotificationAction(notification.id, 'decline', userId, notification.other_user_id.id);

                listItem.appendChild(acceptButton);
                listItem.appendChild(declineButton);
            }

            notificationList.appendChild(listItem);
        });

        const modal = document.getElementById('notificationModal');
        modal.style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching notifications:', error);
    });
}

async function handleNotificationAction(notificationId, status, userId, otherUserId) {
    try {
        console.log(`Handling notification action: ${status} for notification ${notificationId}`);

        if (status === 'accept') {
            console.log(`Sending friend accept request for user ${userId} and user ${otherUserId}`);

            const friendAcceptResponse = await fetch(`/friends/accept/${userId}/${otherUserId}`, {
                method: 'PATCH',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!friendAcceptResponse.ok) {
                throw new Error(`Error accepting friend request: ${friendAcceptResponse.statusText}`);
            }

            console.log('Friend accept request successful');

            const notificationUpdateResponse = await fetch(`/notifications/update/${notificationId}`, {
                method: 'PATCH',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!notificationUpdateResponse.ok) {
                throw new Error(`Error updating notification: ${notificationUpdateResponse.statusText}`);
            }

            console.log('Notification update request successful');
        } else if (status === 'decline') {
            console.log(`Sending decline notification request for notification ${notificationId}`);

            const notificationUpdateResponse = await fetch(`/notifications/update/${notificationId}`, {
                method: 'PATCH',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'Declined' })
            });

            if (!notificationUpdateResponse.ok) {
                throw new Error(`Error updating notification: ${notificationUpdateResponse.statusText}`);
            }

            console.log('Notification decline request successful');
        }

        // Update the UI or perform any other necessary actions
        getNotifications();
    } catch (error) {
        console.error('Error handling notification action:', error);
    }
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