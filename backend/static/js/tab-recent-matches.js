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


function parseCustomDate(dateString) {
    // Expressão regular para capturar a data e hora
    const datePattern = /([A-Za-z]+)\.\s(\d{1,2}),\s(\d{4}),\s(\d{1,2}):(\d{2})\s([a|p]\.m\.)/;
    const match = dateString.match(datePattern);

    if (!match) {
        console.error("Formato de data inválido:", dateString);
        return null;
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthString = match[1].replace(".", "").trim();  // Remove o ponto e espaços
    const month = monthNames.indexOf(monthString);
    console.log("Month ",month)
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    let hours = parseInt(match[4], 10);
    const minutes = parseInt(match[5], 10);
    const period = match[6]; // "a.m." ou "p.m."

    // Converte para o formato 24 horas
    if (period === "p.m." && hours < 12) {
        hours += 12;
    } else if (period === "a.m." && hours === 12) {
        hours = 0;
    }

    // Retorna um objeto Date válido
    return new Date(Date.UTC(year, month, day, hours, minutes));
}


// Formatar data com dia
function formatTimestamp_day(timestamp) {
    console.log("aqui2", timestamp)
    const date = parseCustomDate(timestamp); // Usar a função de parsing
    console.log("aqui", date)
    if (!date) return "Invalid date"; // Verifica se o parsing falhou

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    return `${day}, ${month}. ${year}`;
}

// Formatar timestamp com segundos
function formatTimestamp_second(timestamp) {
    const date = parseCustomDate(timestamp); // Usar a função de parsing
    if (!date) return "Invalid time"; // Verifica se o parsing falhou

    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}


// Converter datas no div
function convertDateInDiv1(div_class) {
    const dateDivs = document.querySelectorAll(div_class);
    dateDivs.forEach(div => {
        const isoTimestamp = div.textContent;
        const formattedDate = formatTimestamp_day(isoTimestamp);
        div.textContent = formattedDate;
    });
}


// Converter datas no div
function convertDateInDiv2(div_class) {
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

// Converter colocações
function convertPlacement() {
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
function convertduration() {
    const places = document.querySelectorAll(".duration");
    places.forEach(div => {
        const duration = div.textContent;
        const formatted = calculateTimeDifference(duration);
        div.textContent = formatted;
    });
}

// Adicionar ouvintes de eventos aos tabs
const gamesTab = document.getElementById('tab-games');
if (gamesTab) {
    gamesTab.addEventListener('click', function() {
        onGamesClick(); // Muda para jogos
        convertduration(); // Converte durações
        convertDateInDiv1(".date-day"); // Converte datas
        convertDateInDiv2(".date-second"); // Converte datas
    });
}

const tournamentsTab = document.getElementById('tab-tournaments');
if (tournamentsTab) {
    tournamentsTab.addEventListener('click', function() {
        onTournamentsClick(); // Muda para torneios
        convertPlacement(); // Converte colocações
    });
}

const profileTab = document.getElementById('tab-profile');
if (profileTab) {
    profileTab.addEventListener('click', function() {
        onProfileClick(); // Muda para perfil
    });
}
