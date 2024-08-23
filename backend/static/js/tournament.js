/*function setStatus(elementId, status) {
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

*/
document.addEventListener('DOMContentLoaded', () => {
    const statusElements = document.querySelectorAll('.status-tourn');

    statusElements.forEach(statusElement => {
        const statusText = statusElement.textContent.trim().toLowerCase();

        switch (statusText) {
            case 'ongoing':
                statusElement.classList.add('status-ongoing');
                break;
            case 'open':
                statusElement.classList.add('status-open');
                break;
            case 'closed':
                statusElement.classList.add('status-closed');
                break;
            default:
                break;
        }
    });
});