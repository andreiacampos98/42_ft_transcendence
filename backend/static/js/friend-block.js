function setStatus(elementId, status) {
    const friendBlock = document.getElementById(elementId);
    if (friendBlock == null) {
        return ;
    }
    const statusSpan = friendBlock.querySelector('.status');
    
    friendBlock.setAttribute('data-status', status);
    statusSpan.textContent = status.charAt(0).toUpperCase() + status.slice(1);
}

