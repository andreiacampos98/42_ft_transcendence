function interpolateColor(startColor, endColor, factor) {
	const result = startColor.slice();
	factor = Math.min(factor, 1);
	for (let i = 0; i < 3; i++) {
		result[i] = Math.round(result[i] + factor * (endColor[i] - startColor[i]));
	}
	return result;
}

function rgbToHex(rgb) {
	return `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

function applyGradientToHeatmap() {
	const rallyLengthSquares = document.querySelectorAll('.square-length');
	const ballSpeedSquares = document.querySelectorAll('.square-speed');
	const startColor = [255, 255, 255];
	const endColor = [253, 180, 39]; 
	const FAST_BALL_SPEED = 2;
	const HIGH_RALLY_LENGTH = 50;

	rallyLengthSquares.forEach(square => {
		const value = parseInt(square.textContent);
		const factor = value / HIGH_RALLY_LENGTH;

		const interpolatedColor = interpolateColor(startColor, endColor, factor);
		const hexColor = rgbToHex(interpolatedColor);

		square.style.backgroundColor = hexColor;
	});
	ballSpeedSquares.forEach(square => {
		const value = parseInt(square.textContent);
		const factor = value / FAST_BALL_SPEED;

		const interpolatedColor = interpolateColor(startColor, endColor, factor);
		const hexColor = rgbToHex(interpolatedColor);

		square.style.backgroundColor = hexColor;
	});
}

function fillHeatmap(rallyLengths, ballSpeeds){
	const rallyLengthLabels = document.querySelectorAll('.square-length');
	const ballSpeedLabels = document.querySelectorAll('.square-speed');


	rallyLengths.forEach((rally, i) => {
		rallyLengthLabels[i].textContent = rally
	});
	ballSpeeds.forEach((speed, i) => ballSpeedLabels[i].textContent = speed);
	
}



async function loadCharts() {
	const gameID = document.getElementById('game-id').getAttribute('data-game-id');
	const response = await fetch(`/games/${gameID}/goals`, {
		method: "GET",
	});
	const data = await response.json();

	const rallyLengths = data.map((goal) => goal.rally_length);
	const ballSpeeds = data.map((goal) => goal.ball_speed);

	fillHeatmap(rallyLengths, ballSpeeds);
	applyGradientToHeatmap();
	
	const user1ID = document.getElementById('game-id').getAttribute('data-user-1');
	const user2ID = document.getElementById('game-id').getAttribute('data-user-2');
	const username1 = document.getElementById('game-id').getAttribute('data-user-1-name');
	const username2 = document.getElementById('game-id').getAttribute('data-user-2-name');

	const gameState = {};
	gameState[user1ID] = {'score': 0, 'state': []};
	gameState[user2ID] = {'score': 0, 'state': []};

	data.forEach((goal) => {
		gameState[goal.user].score++;
		gameState[user1ID].state.push(gameState[user1ID].score);
		gameState[user2ID].state.push(gameState[user2ID].score);
	});


	var options = {
		chart: {
			type: 'line',
			id: 'line',
			toolbar: {
				show: false
			},
		},
		stroke: {
			curve: 'straight',
		},
		markers: {
			size: 1,
		},
		series: [
			{
				name: username1,
				data: gameState[user1ID].state
			},
			{
				name: username2,
				data: gameState[user2ID].state
			}
		],
		xaxis: {
			categories: [1, 2, 3, 4, 5, 6, 7, 8, 9],
			labels: {
				style: {
					colors: '#c3c3c3bb',  
					fontSize: '14px',   
					fontWeight: 600     
				}
			},
			axisTicks: {
				show: true,
				color: '#333',         
				height: 6              
			}
		},
		yaxis: {
			labels: {
				style: {
					colors: '#c3c3c3bb',  
					fontSize: '12px',   
					fontWeight: 500
				}
			},
			axisTicks: {
				show: true,
				color: '#333',         
				width: 5               
			}
		},
		grid: {
			show: true,
			borderColor: '#c3c3c3bb',    
			xaxis: {
				lines: {
					show: true         
				}
			},
			yaxis: {
				lines: {
					show: true         
				}
			}
		},
		legend: {
			show: true,
			horizontalAlign: 'center', 
			fontSize: '16px',          
			fontWeight: 600,           
			labels: {
				colors: ['#c3c3c3bb', '#c3c3c3bb'],  
			},
		},
		colors: ['#F8D082', '#336181'],
	};

	if (!charts['line']) 
		charts['line'] = new ApexCharts(document.querySelector('#chart3'), options);
	else 
		charts['line'].el = document.querySelector('#chart3');
	
	charts['line'].render();
}

loadCharts();