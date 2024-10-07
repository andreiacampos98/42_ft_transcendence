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