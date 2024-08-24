
function toggleLeftDiv() {
    const leftDiv = document.getElementById('left-div');
    leftDiv.classList.toggle('expanded');
    const main_cont = document.getElementById('main-content');
    main_cont.classList.toggle('compressed')
    main_cont.classList.toggle('non_compressed')
}