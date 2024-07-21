function setStatus(elementId, status) {
    const friendBlock = document.getElementById(elementId);
    const statusSpan = friendBlock.querySelector('.status');
    
    // Set the data-status attribute
    friendBlock.setAttribute('data-status', status);

    // Update the status text
    statusSpan.textContent = status.charAt(0).toUpperCase() + status.slice(1);
}

// Example usage
setStatus('friend1', 'online');  // Can be 'online', 'offline', or 'playing'
setStatus('friend2', 'offline');  // Can be 'online', 'offline', or 'playing'
setStatus('friend3', 'playing');  // Can be 'online', 'offline', or 'playing'
