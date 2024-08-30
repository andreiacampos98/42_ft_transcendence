function friends_add(event, userId1, userId2) {
    event.preventDefault(); 

    fetch(`/friends/${userId1}/${userId2}`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        },
        body: JSON.stringify({
            'user1_id': userId1,
            'user2_id': userId2
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.data == {}) {
            alert(data.message);
        } else {
            alert(data.message);
            window.location.reload();
            // Optionally, you might want to update the UI here
        }
    })
    .catch(error => console.error('Error:', error));

    return false; // Prevent form submission
}

function friends_remove(event, userId1, userId2) {
    event.preventDefault(); 
    fetch(`/friends/${userId1}/${userId2}`, {
        method: 'DELETE',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.data == {}) {
            alert(data.message);
        } else {
            alert(data.message);
            window.location.reload();
            // Optionally, you might want to update the UI here
            // For example, you might remove the friend from the UI or refresh the friend list
        }
    })
    .catch(error => console.error('Error:', error));

    return false; // Prevent form submission
}
