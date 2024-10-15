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
function applyGradientToSquares() {
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

// Call the function to apply the background gradient on page load
applyGradientToSquares();

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
      name: 'Player 1',
      data: [1,2,2,2,3,4,4,5,5]
    },
    {
        name: 'Player 2',
        data: [0,0,1,2,2,2,3,4,5]
      }],

    xaxis: {
        categories: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        labels: {
            style: {
                colors: '#c3c3c3bb',  // Color of x-axis labels
                fontSize: '14px',   // Font size of x-axis labels
                fontWeight: 600     // Font weight (boldness)
            }
        },
        axisTicks: {
            show: true,
            color: '#333',         // Color of the x-axis ticks
            height: 6              // Length of the ticks
        }
    },
    yaxis: {
        labels: {
            style: {
                colors: '#c3c3c3bb',  // Color of y-axis labels
                fontSize: '12px',   // Font size of y-axis labels
                fontWeight: 500
            }
        },
        axisTicks: {
            show: true,
            color: '#333',         // Color of the y-axis ticks
            width: 5               // Length of the ticks
        }
    },
    grid: {
        show: true,
        borderColor: '#c3c3c3bb',    // Color of the grid lines
        xaxis: {
            lines: {
                show: true         // Show/hide grid lines on the x-axis
            }
        },
        yaxis: {
            lines: {
                show: true         // Show/hide grid lines on the y-axis
            }
        }
    },
    legend: {
        show: true,
        horizontalAlign: 'center', // Align legend text: 'center', 'left', 'right'
        fontSize: '16px',          // Font size for legend text
        fontWeight: 600,           // Font weight for legend text
        labels: {
            colors: ['#c3c3c3bb', '#c3c3c3bb'],  // Array to set colors for each series
        },
    },
    colors: ['#F8D082', '#336181'],
  };
  
  var chart = new ApexCharts(document.querySelector("#chart"), options);
  
  chart.render();