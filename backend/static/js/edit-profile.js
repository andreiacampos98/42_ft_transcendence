function onEditButtonClick() {
	document.getElementById("save-cancel").style.display = "flex";
	document.getElementById("edit-change1").style.display = "none";
	document.getElementById("edit-change1").classList.remove("d-flex");
    document.getElementById("edit-profile-button").style.display = "none";
    document.getElementById("save-profile-button").style.display = "inline-block";
    document.getElementById("cancel-edit-button").style.display = "inline-block";
    document.getElementById("edit-profile-form").style.display = "block";
    document.getElementById("change-info2").style.display = "none";
    document.getElementById("open-change-password-modal").style.display = "none";

    document.getElementById('profile-picture-input').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                // Define o src da imagem de pré-visualização
                document.getElementById('profile-picture-preview').src = e.target.result;
            }

            // Lê o arquivo como uma URL de dados
            reader.readAsDataURL(file);
        } 
    });
}

function onCancelButtonClick() {
	document.getElementById("edit-change1").style.display = "flex";
	document.getElementById("save-cancel").style.display = "none";
	document.getElementById("save-cancel").classList.remove("d-flex");
    document.getElementById("edit-profile-button").style.display = "flex";
    document.getElementById("save-profile-button").style.display = "none";
    document.getElementById("cancel-edit-button").style.display = "none";
    document.getElementById("edit-profile-form").style.display = "none";
    document.getElementById("change-info1").style.display = "block";
    document.getElementById("change-info2").style.display = "block";
    document.getElementById("open-change-password-modal").style.display = "block";
}

function onSaveButtonClick(event, userId) {
    event.preventDefault(); 
    const formData = new FormData(document.getElementById("edit-profile-form"));

    fetch(`/users/${userId}/update`, {
        method: "POST",
        body: formData,
        headers: {
            "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
        }
    })
    .then(response => response.json())
    .then(data => {
        if (JSON.stringify(data.data) === '{}') {
            alert(data.message);
        } else {
            history.pushState(null, '', `/users/${userId}`);
            htmx.ajax('GET', `/users/${userId}`, {
                target: '#main'  
            });
        }
    })
    .catch(error => console.error('Error:', error));
}

// Get the modal
var modal2 = document.getElementById("modal2");
// Get the button that opens the modal
var btn2 = document.getElementById("remove-friend-button");
// Get the  element that closes the modal
var goback = document.getElementById("cancel");
// When the user clicks the button, open the modal
if (btn2) {
    btn2.onclick = function() {
		modal2.style.display = "block";
	}
}

goback.onclick = function() {
  modal2.style.display = "none";
}

// When the user clicks anywhere outside of the modal2, close it
window.onclick = function(event) {
  if (event.target == modal2) {
    modal2.style.display = "none";
  }
}

async function loadDonutChart() {
	const userID = document.querySelector('button[onclick="getChangePassword()"]').getAttribute('data-user-id');
	const response = await fetch(`/stats/${userID}`, {
		method: "GET",
	});
	const stats = await response.json();
	
	const remoteTime = Math.round(stats.remote_time_played / 60);
	const aiTime = Math.round(stats.ai_time_played / 60);
	const localTime = Math.round(stats.local_time_played / 60);
	const tournamentTime = Math.round(stats.tournament_time_played / 60);

	var options = {
		chart: {
			type: 'donut',      
			height: 200         
		},
		series: [remoteTime, aiTime, localTime, tournamentTime], 
		labels: ['Remote Game', 'AI mode', 'Local Game', 'Tournaments'], 
		colors: ['#EC6158', '#46CDBD', '#66DD53', '#FFAD72'],    
		legend: {
			position: 'right',   
			offsetY: 25,          
			offsetX: 100,
			markers: {
				width: 12,
				height: 12
			},
			fontSize: '14px',
			fontWeight: 'bold',
			labels: {
				colors: ['#fff','#fff','#fff','#fff']  
			}
		},
		plotOptions: {
			pie: {
				donut: {
					size: '70%', 
					labels: {
						show: true,
						total: {
							show: true,
							label: 'Min',
							color: '#fff',
						},
						value: {
							fontSize: "28px",
							fontWeight: "bold"
						}
					}
				},
				expandOnClick: false 
			},
		   
		},
		stroke: {
			show: false,
		
		},
		dataLabels: {
			enabled: false        
		}
	};

	var chart = new ApexCharts(document.querySelector("#chart1"), options);
	chart.render();
}

async function loadBarLineChart() {
	const userID = document.querySelector('button[onclick="getChangePassword()"]').getAttribute('data-user-id');
	const response = await fetch(`/graph/${userID}`, {
		method: "GET",
	});
	const stats = await response.json();
	console.log(stats);

	const winRates = stats.map((x) => x.win_rate);
	const totalGames = stats.map((x) => x.total_games);

	var options = {
		chart: {
			type: 'line',
			height: 350,
			stacked: false,
			toolbar: {
				show: false
			},
			width: '100%',
		},
		series: [{
			name: 'Win Rate',
			type: 'column',
			data: totalGames
		}, {
			name: 'Win Rate Line',
			type: 'line',
			data: winRates,
			stroke: {
				width: 2,
			},
		}],
		xaxis: {
			categories: ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
			labels: {
				rotate: 0,
				style: {
					colors: '#c3c3c3bb', 
					fontSize: '14px',  
					fontWeight: 600    
				}
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			}
		},
		colors: ['#605CFF', '#83E9FF'],
		yaxis: {
			show: false
		},
		grid: {
			show: false
		},
		tooltip: {
			enabled: false
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			show: false
		  }
	};
	
	var chart = new ApexCharts(document.querySelector("#chart2"), options);
	chart.render();
}

loadDonutChart();
loadBarLineChart();

