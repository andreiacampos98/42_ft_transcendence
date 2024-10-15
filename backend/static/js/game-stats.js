function interpolateColor(startColor, endColor, factor) {
    const result = startColor.slice(); // Create a copy of the start color
    for (let i = 0; i < 3; i++) {
        // Interpolate each color component (R, G, B)
        result[i] = Math.round(result[i] + factor * (endColor[i] - startColor[i]));
    }
    return result;
}

// Convert RGB array to hex color string
function rgbToHex(rgb) {
    return `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

// Main function to apply the background color to all divs with class 'square'
function applyGradientToHeatmap() {
    const squares1 = document.querySelectorAll('.square-length'); // Select all divs with class 'square'
    const squares2 = document.querySelectorAll('.square-speed'); // Select all divs with class 'square'
    const startColor = [255, 255, 255]; // RGB for #FFFFFF (white)
    const endColor = [253, 180, 39];  // RGB for #F8D082 (light orange)

    squares1.forEach(square => {
        const value = parseInt(square.textContent); // Get the text inside the div and convert to integer
        const factor = value / 100; // Calculate the interpolation factor (0 to 1)

        const interpolatedColor = interpolateColor(startColor, endColor, factor); // Get the interpolated color
        const hexColor = rgbToHex(interpolatedColor); // Convert the RGB color to hex format

        square.style.backgroundColor = hexColor; // Apply the background color to the div
    });
    squares2.forEach(square => {
        const value = parseInt(square.textContent); // Get the text inside the div and convert to integer
        const factor = value / 100; // Calculate the interpolation factor (0 to 1)

        const interpolatedColor = interpolateColor(startColor, endColor, factor); // Get the interpolated color
        const hexColor = rgbToHex(interpolatedColor); // Convert the RGB color to hex format

        square.style.backgroundColor = hexColor; // Apply the background color to the div
    });
}

function fillHeatmap(rallyLengths, ballSpeeds){
	const rallyLengthLabels = document.querySelectorAll('.square-length');
	const ballSpeedLabels = document.querySelectorAll('.square-speed');

	console.log(rallyLengths, ballSpeeds);

	rallyLengths.forEach((rally, i) => rallyLengthLabels[i].textContent = rally);
	ballSpeeds.forEach((speed, i) => ballSpeedLabels[i].textContent = speed);
	
}

// Call the function to apply the background gradient on page load


async function loadCharts() {
	const gameID = document.getElementById('game-id').getAttribute('data-game-id');
	const response = await fetch(`/games/${gameID}/goals`, {
		method: "GET",
	});
	const goals = await response.json();
	console.log(goals);

	const rallyLengths = goals.map((goal) => goal.rally_length);
	const ballSpeeds = goals.map((goal) => goal.ball_speed);

	fillHeatmap(rallyLengths, ballSpeeds);
	applyGradientToHeatmap();
	
	const user1ID = document.getElementById('game-id').getAttribute('data-user-1');
	const user2ID = document.getElementById('game-id').getAttribute('data-user-2');
	const username1 = document.getElementById('game-id').getAttribute('data-user-1-name');
	const username2 = document.getElementById('game-id').getAttribute('data-user-2-name');

	const gameState = {};
	gameState[user1ID] = {'score': 0, 'state': []};
	gameState[user2ID] = {'score': 0, 'state': []};

	goals.forEach((goal) => {
		gameState[goal.user].score++;
		gameState[user1ID].state.push(gameState[user1ID].score);
		gameState[user2ID].state.push(gameState[user2ID].score);
	});

	console.log(gameState);

	var options = {
		chart: {
		  type: 'line'
		},
		stroke: {
			curve: 'straight',
		},
		markers: {
			size: 1,
		},
		series: [{
		  name: username1,
		  data: gameState[user1ID].state
		},
		{
			name: username2,
			data: gameState[user2ID].state
		  }],
	
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
	  
	var chart = new ApexCharts(document.querySelector("#chart"), options);
	chart.render();
}

loadCharts();


