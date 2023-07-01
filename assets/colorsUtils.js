function generateDistinctColors(numColors) {
    /**
     * Generate an array of distinct colors
     * @param {number} numColors - Number of colors to generate
     * @returns {string[]} Array of colors in rgb format
     * @see https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
     */
    const colors = [];
    const goldenRatio = 0.618033988749895;
    let hue = 0.8;
    for (let i = 0; i < numColors; i++) {
        hue += goldenRatio;
        hue %= 1;
        const color = hsvToRgb(hue, 0.95, 0.95); // value mean
        colors.push(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
    }
    return colors;
}

function hsvToRgb(h, s, v) {
    /**
     * Convert HSV to RGB
     * @param {number} h - Hue
     * @param {number} s - Saturation
     * @param {number} v - Value
     * @returns {number[]} Array of RGB values
     */
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0:
            r = v; g = t; b = p; break;
        case 1:
            r = q; g = v; b = p; break;
        case 2:
            r = p; g = v; b = t; break;
        case 3:
            r = p; g = q; b = v; break;
        case 4:
            r = t; g = p; b = v; break;
        case 5:
            r = v; g = p; b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}