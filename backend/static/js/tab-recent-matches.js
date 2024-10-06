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

    // Format the result as dd, mmm yyyy hh:mm:ss
    return `${day}, ${month}. ${year}`;
}

// Function to convert the content of the div
function convertDateInDiv1(div_class) {
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
    console.log(timestamp)
    const date = new Date(timestamp);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Get the day, month, year, hours, minutes, and seconds from the date object
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    // Format the result as dd, mmm yyyy hh:mm:ss
    return `${hours}:${minutes}:${seconds}`;
}

// Function to convert the content of the div
function convertDateInDiv2(div_class) {
    // Get the div element by its ID
    const dateDivs = document.querySelectorAll(div_class);

    // Loop through each div and convert its content
    dateDivs.forEach(div => {
        const isoTimestamp = div.textContent; // Get the ISO date string from the div
        const formattedDate = formatTimestamp_second(isoTimestamp); // Format the date
        div.textContent = formattedDate; // Set the formatted date back into the div
    });
}
// Call the function to convert the date before displaying it
convertDateInDiv1(".date-day");
convertDateInDiv2(".date-second");


function placement_func(placement) {

    p = parseInt(placement)
    if (p == 1) {
        return `1st PLACE`
    } else if (p == 2) {
        return `2nd PLACE`
    } else if (p == 3) {
        return `3rd PLACE`
    } else {
        return `${p}th PLACE`
    }
    
}

function convertPlacement() {
    // Get the div element by its ID
    const place = document.querySelectorAll(".placement");

    // Loop through each div and convert its content
    place.forEach(div => {
        const placement = div.textContent; // Get the ISO date string from the div
        if (parseInt(placement) == 1) {
            div.classList.add("victory");
        };
        const formatted = placement_func(placement); // Format the date
        div.textContent = formatted; // Set the formatted date back into the div
    });
}

convertPlacement();

function calculateTimeDifference(duration) {
    // Convert both timestamps to milliseconds

    // Convert milliseconds to total seconds
    let totalSeconds = Math.floor(parseInt(duration)/ 1000);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Pad the seconds with a leading zero if less than 10
    const formattedSeconds = String(seconds).padStart(2, '0');

    // Return the formatted time in mm:ss format
    return `${minutes}:${formattedSeconds} min`;
}

function convertduration() {
    // Get the div element by its ID
    const place = document.querySelectorAll(".duration");

    // Loop through each div and convert its content
    place.forEach(div => {
        const duration = div.textContent; // Get the ISO date string from the div
        const formatted = calculateTimeDifference(duration); // Format the date
        div.textContent = formatted; // Set the formatted date back into the div
    });
}

convertduration();