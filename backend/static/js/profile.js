var modal2 = document.getElementById("modal2");
var btn2 = document.getElementById("remove-friend-button");
var goback = document.getElementById("cancel");


if (btn2) {
	btn2.onclick = function() {
		modal2.style.display = "block";
	}
}

goback.onclick = function() {
	modal2.style.display = "none";
}

window.onclick = function(event) {
	if (event.target == modal2) {
		modal2.style.display = "none";
	}
}

function formatDate(timestamp) {
	const date = new Date(timestamp);
	
	const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	const day = String(date.getUTCDate()).padStart(2, '0');
	const month = monthNames[date.getUTCMonth()];
	const year = date.getUTCFullYear();
	const hours = String(date.getUTCHours()).padStart(2, '0');
	const minutes = String(date.getUTCMinutes()).padStart(2, '0');

	const suffixes = ['st', 'nd', 'rd'];
	const dayUnits = date.getUTCDate() % 10;

	if ((dayUnits >= 1 && dayUnits <= 3) && (date.getUTCDate() < 10 || date.getUTCDate() > 13))
		return `${day}${suffixes[dayUnits - 1]} ${month}. ${year}, ${hours}:${minutes}`;
	return `${day}th ${month}. ${year}, ${hours}:${minutes}`;
}

function formatRecordsTimestamp(divClass) {
	
	const recordTimeDivs = document.querySelectorAll(divClass);
	
	recordTimeDivs.forEach(div => {
		div.textContent = formatDate(div.textContent);
	});
}

async function loadDonutChart() {
	const userID = document.getElementById('main-content').getAttribute('data-user-view-id');
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
			offsetX: -110,
			offsetY: 10,    
			height: 200, 
			width: '100%',  
		},
		series: [remoteTime, aiTime, localTime, tournamentTime], 
		labels: ['Remote Games', 'AI Mode', 'Local Games', 'Tournaments'], 
		colors: ['#EC6158', '#46CDBD', '#66DD53', '#FFAD72'],    
		legend: {
			position: 'right',   
			offsetY: 25,          
			offsetX: 100,
			markers: {
				width: 12,
				height: 12
			},
			fontSize: '16px',
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
	const userID = document.getElementById('main-content').getAttribute('data-user-view-id');
	const response = await fetch(`/graph/${userID}`, {
		method: "GET",
	});
	const dailyRawStats = await response.json();
	// const dailyRawStats = TEST_STATS;

	const rawWinRates = dailyRawStats.map((x) => x.win_rate);
	const rawTotalGames = dailyRawStats.map((x) => x.total_games);
	const winRates = new Array(7).fill(0);
	const totalGames = new Array(7).fill(0);

	const today = new Date();
	var lastMonday = new Date();
	lastMonday.setDate(today.getDate() - (today.getDay() + 6) % 7);

	rawWinRates.forEach((winRate, i) => {
		const timestamp = new Date(dailyRawStats[i].day);
		if (timestamp.getDate() < lastMonday.getDate())
			return ;
		
		const weekday = (timestamp.getDay() + 6) % 7;
		winRates[weekday] = winRate;
	});
	rawTotalGames.forEach((numGames, i) => {
		const timestamp = new Date(dailyRawStats[i].day);
		if (timestamp.getDate() < lastMonday.getDate())
			return ;

		const weekday = (timestamp.getDay() + 6) % 7;
		totalGames[weekday] = numGames;
	});
	
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
		followCursor: true,
		plotOptions: {
			bar: {
				borderRadius: 10,
			}
		},
		grid: {
			show: true,
			borderColor: '#ffffff0C',    
			xaxis: {
				lines: {
					show: true         
				}
			},
			yaxis: {
				lines: {
					show: true         
				}
			},
		},
		series: [
			{
				name: 'Games Played',
				type: 'column',
				data: totalGames
			}, 
			{
				name: 'Win Rate (%)',
				type: 'line',
				data: winRates,
				stroke: {
					width: 2,
				},
			}
		],
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
		tooltip: {
			y: {
			formatter: function (val) {
				return val;
			}
			},
		},
		dataLabels: {
			enabled: false,
		},
		legend: {
			show: true,
			horizontalAlign: 'center', 
			fontSize: '14px',          
			labels: {
				colors: ['#FFFFFF', '#FFFFFF'],  
			},
		}
	};
	
	var chart = new ApexCharts(document.querySelector("#chart2"), options);
	chart.render();
}


formatRecordsTimestamp(".record-date");
loadDonutChart();
loadBarLineChart();

