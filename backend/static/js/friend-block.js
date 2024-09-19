function setStatus(elementId, status) {
    const friendBlock = document.getElementById(elementId);
    if (friendBlock == null) {
        return ;
    }
    const statusSpan = friendBlock.querySelector('.status');
    
    // Set the data-status attribute
    friendBlock.setAttribute('data-status', status);

    // Update the status text
    statusSpan.textContent = status.charAt(0).toUpperCase() + status.slice(1);
}

