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

    // Array with the abbreviated month names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Get the day, month, year, hours, minutes, and seconds from the date object
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();

	const suffixes = ['st', 'nd', 'rd'];
	const dayUnits = date.getUTCDate() % 10;
	
	if ((dayUnits >= 1 && dayUnits <= 3) && (date.getUTCDate() < 10 || date.getUTCDate() > 13))
		return `${day}${suffixes[dayUnits - 1]}, ${month}. ${year}`;
	return `${day}th, ${month}. ${year}`;
}

// Function to convert the content of the div
function formatDays(div_class) {
    // Get the div element by its ID
    const dateDivs = document.querySelectorAll(div_class);

	// Loop through each div and convert its content
	dateDivs.forEach(div => {
		const isoTimestamp = div.textContent; // Get the ISO date string from the div
		const formattedDate = formatTimestamp_day(isoTimestamp); // Format the date
		div.textContent = formattedDate; // Set the formatted date back into the div
	});
}

function formatTimestamp_second(timestamp) {
    const date = new Date(timestamp);

    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    // Format the result as dd, mmm yyyy hh:mm:ss
    return `${hours}:${minutes}:${seconds}`;
}

// Function to convert the content of the div
function formatRecordsTimestamp(div_class) {
    // Get the div element by its ID
    const dateDivs = document.querySelectorAll(div_class);

    // Loop through each div and convert its content
    dateDivs.forEach(div => {
        const isoTimestamp = div.textContent; // Get the ISO date string from the div
        const formattedDate = formatTimestamp_second(isoTimestamp); // Format the date
        div.textContent = formattedDate; // Set the formatted date back into the div
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

// Converter colocações
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

// Calcular a diferença de tempo
function calculateTimeDifference(duration) {
    let totalSeconds = Math.floor(parseInt(duration));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${minutes}:${formattedSeconds} min`;
}

// Converter duração
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

formatTournamentPlacements(); // Converte colocações
formatGameDurations(); // Converte durações
formatDays(".date-day"); // Converte datas
formatRecordsTimestamp(".date-second"); // Converte datas
