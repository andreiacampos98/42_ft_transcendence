function onProfileClick() {
    document.getElementById("games").style.display = "none";
    document.getElementById("tournaments").style.display = "none";
    document.getElementById("profile").style.display = "block";
    document.getElementById("tab-tournaments").classList.remove("active");
    document.getElementById("tab-profile").classList.add("active");
    document.getElementById("tab-games").classList.remove("active");
}
function onGamesClick() {
    document.getElementById("games").style.display = "block";
    document.getElementById("tournaments").style.display = "none";
    document.getElementById("profile").style.display = "none";
    document.getElementById("tab-tournaments").classList.remove("active");
    document.getElementById("tab-games").classList.add("active");
    document.getElementById("tab-profile").classList.remove("active");
}

function onTournamentsClick() {
    document.getElementById("games").style.display = "none";
    document.getElementById("tournaments").style.display = "block";
    document.getElementById("profile").style.display = "none";
    document.getElementById("tab-games").classList.remove("active");
    document.getElementById("tab-tournaments").classList.add("active");
    document.getElementById("tab-profile").classList.remove("active");
}

