function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function gettextColor(rgb){
    var brightness = Math.round(((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) /1000);

    if (brightness > 125){
        return "#000000";
    }
    else
    {
        return "#ffffff";
    }
}

function gettextColor2(rgb){
    var brightness = Math.round(((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 114)) /1000);

    if (brightness > 125){
        return "#000000";
    }
    else
    {
        return "#ffffff";
    }
}

function rgbToStr(rgb,alpha){
    alpha = typeof alpha !== 'undefined' ? alpha: 1;
    return "rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+","+alpha+")";
}
function rgbToStr2(rgb,alpha)
{
    alpha = typeof alpha !== 'undefined' ? alpha: 1;
    return "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+alpha+")";
}

function getAverageRGB(imgEl) {

    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;

}