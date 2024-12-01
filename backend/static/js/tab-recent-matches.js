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


function formatTimestamp_day(timestamp) {
    const date = new Date(timestamp);

    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();

	const suffixes = ['st', 'nd', 'rd'];
	const dayUnits = date.getUTCDate() % 10;
	
	if ((dayUnits >= 1 && dayUnits <= 3) && (date.getUTCDate() < 10 || date.getUTCDate() > 13))
		return `${day}${suffixes[dayUnits - 1]}, ${month}. ${year}`;
	return `${day}th, ${month}. ${year}`;
}


function formatDays(div_class) {
    
    const dateDivs = document.querySelectorAll(div_class);

	
	dateDivs.forEach(div => {
		const isoTimestamp = div.textContent; 
		const formattedDate = formatTimestamp_day(isoTimestamp); 
		div.textContent = formattedDate; 
	});
}

function formatTimestamp_second(timestamp) {
    const date = new Date(timestamp);

    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    
    return `${hours}:${minutes}:${seconds}`;
}


function formatRecordsTimestamp(div_class) {
    
    const dateDivs = document.querySelectorAll(div_class);

    
    dateDivs.forEach(div => {
        const isoTimestamp = div.textContent; 
        const formattedDate = formatTimestamp_second(isoTimestamp); 
        div.textContent = formattedDate; 
    });
}



function placement_func(placement) {
    p = parseInt(placement);
    if (p == 1) {
        return `1st PLACE`;
    } else if (p == 2) {
        return `2nd PLACE`;
    } else if (p == 3) {
        return `3rd PLACE`;
    } else {
        return `${p}th PLACE`;
    }
}


function formatTournamentPlacements() {
    const place = document.querySelectorAll(".placement");
    place.forEach(div => {
        const placement = div.textContent;
        if (parseInt(placement) == 1) {
            div.classList.add("victory");
        }
        const formatted = placement_func(placement);
        div.textContent = formatted;
    });
}


function calculateTimeDifference(duration) {
    let totalSeconds = Math.floor(parseInt(duration));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${minutes}:${formattedSeconds} min`;
}


function formatGameDurations() {
    const places = document.querySelectorAll(".duration");
    places.forEach(div => {
        const duration = div.textContent;
        const formatted = calculateTimeDifference(duration);
        div.textContent = formatted;
    });
}

document.getElementById('tab-games').onclick = () => onGamesClick();
document.getElementById('tab-tournaments').onclick = () => onTournamentsClick();
document.getElementById('tab-profile').onclick = () => onProfileClick();

formatTournamentPlacements(); 
formatGameDurations(); 
formatDays(".date-day"); 
formatRecordsTimestamp(".date-second"); 
