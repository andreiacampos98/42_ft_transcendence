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

async function getUserStats() {
	const userID = document.querySelector('button[onclick="getChangePassword()"]').getAttribute('data-user-id');
	const response = await fetch(`/stats/${userID}`, {
		method: "GET",
		// headers: {
		// 	"X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
		// }
	});
	const stats = await response.json();
	console.log(stats);
	
	const remoteTime = Math.round(stats.remote_time_played / 60);
	const aiTime = Math.round(stats.ai_time_played / 60);
	const localTime = Math.round(stats.local_time_played / 60);
	const tournamentTime = Math.round(stats.tournament_time_played / 60);

	var options = {
		chart: {
			type: 'donut',       // Type of chart: Donut
			height: 200          // Height of the chart
		},
		series: [remoteTime, aiTime, localTime, tournamentTime],  // Data values for the donut chart
		labels: ['Remote Game', 'AI mode', 'Local Game', 'Tournaments'],  // Labels for each section
		colors: ['#EC6158', '#46CDBD', '#66DD53', '#FFAD72'],     // Custom colors for each segment
		legend: {
			position: 'right',    // Legend position to the right
			offsetY: 25,           // Center the legend vertically
			offsetX: 100,
			markers: {
				width: 12,
				height: 12
			},
			fontSize: '14px',
			fontWeight: 'bold',
			labels: {
				colors: ['#fff','#fff','#fff','#fff']   // Change the legend text color to white
			}
		},
		plotOptions: {
			pie: {
				donut: {
					size: '70%',  // Size of the donut hole (70% of the total width)
					labels: {
						show: true,
						total: {
							show: true,
							label: 'Min',
							color: '#fff',
							style: {
								fontSize: '20px', // Font size of the number
								fontWeight: 'bold',
								color: '#fff'      // Color of the number
							}
						}
					}
				},
				expandOnClick: false  // Prevent the slices from expanding when clicked
			},
		   
		},
		stroke: {
			show: false,
		
		},
		dataLabels: {
			enabled: false         // Disable labels inside the slices
		}
	};
	// Render the Donut Chart
	var donut = new ApexCharts(document.querySelector("#chart1"), options);
	donut.render();
}

getUserStats();

var options = {
	chart: {
		type: 'line', // We will use 'line' type to draw the connecting line
		height: 350,
		stacked: false, // Do not stack bars
		toolbar: {
			show: false // Hide the toolbar
		},
		width: '100%',
	},
	series: [{
		name: 'Win Rate', // Added name for clarity
		type: 'column', // Column series for bars
		data: [7.0, 8.0, 9.0, 6.0, 8.5, 7.5, 9.5] // Sample win rates for each day
	}, {
		name: 'Win Rate Line', // Added name for clarity
		type: 'line', // Line series to connect the bars
		data: [7.0, 8.0, 9.0, 6.0, 8.5, 7.5, 9.5], // Same data to connect the tops
		stroke: {
			width: 2,
		},
	}],
	xaxis: {
		categories: ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'], // Days of the week
		labels: {
			rotate: 0, // Set labels to horizontal
			style: {
				colors: '#c3c3c3bb',  // Color of x-axis labels
				fontSize: '14px',   // Font size of x-axis labels
				fontWeight: 600     // Font weight (boldness)
			}
		},
		axisBorder: {
			show: false // Hide x-axis border
		},
		axisTicks: {
			show: false // Hide ticks on the x-axis
		}
	},
	colors: ['#605CFF', '#83E9FF'], // Colors for the bars and line
	yaxis: {
		show: false // Hide the y-axis
	},
	grid: {
		show: false // Hide the grid
	},
	tooltip: {
		enabled: false // Disable tooltips
	},
	dataLabels: {
		enabled: false // Disable data labels
	},
	legend: {
		show: false
	  }
};

var columns = new ApexCharts(document.querySelector("#chart2"), options);
columns.render();