function addClassToTopLevelDivs(className) {
    // Select all div elements that are direct children of the body
    const topLevelDivs = document.body.querySelectorAll(':scope > div');
    topLevelDivs.forEach(div => {
        if (div.id !== 'sidebar') {
            div.classList.toggle(className);
        }
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
    const button = document.getElementById('toggle-button');
    button.classList.toggle('show');
    addClassToTopLevelDivs('darkened-image');
}
