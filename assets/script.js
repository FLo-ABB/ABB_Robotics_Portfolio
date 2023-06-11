// Define charts array with robot charts and update canvas elements in HTML.
let charts = [
    getRobotChart('myChartArticulated', "Articulated"),
    getRobotChart('myChartPalletizer', "Palletizer"),
    getRobotChart('myChartSCARA', "SCARA"),
    getRobotChart('myChartPicker', "Parallel"),
    getRobotChart('myChartPaint', "Paint"),
    getRobotChart('myChartCollaborative', "Collaboratives")
];

/**
 * Creates and Returns a robots chart with specified ID and product type.
 * 
 * @param {string} chartId - ID of chart canvas element.
 * @param {string} productType - Type of robot product.
 * @returns {Chart} - Chart object.
 */
function getRobotChart(chartId, productType) {
    let nbTotal = getNumberOfRobotsByType(productType, myJson);
    let nbActual = 0;
    if (document.getElementById(chartId) === null) {
        console.error("Chart ID not found: " + chartId);
        return;
    }
    const ctx = document.getElementById(chartId).getContext('2d');
    const actualChart = createEmptyChart(ctx);
    let json_sorted = getJsonVariantSorted(myJson, "payload");
    json_sorted.items.filter(item => ((item.product_type === productType) && !["IRB 460", "IRB 760", "IRB 660"].includes(item.product_name)) || (productType === "Palletizer" && ["IRB 460", "IRB 760", "IRB 660"].includes(item.product_name)))
        .forEach(item => {
            createRobotVariantPoints(actualChart, item, nbTotal, nbActual);
            nbActual++;
        });
    return getResizedChart(actualChart);
}

/**
 * 
 * returns a empty product chart
 * 
 * @param {String} ctx 
 * @returns {Chart} - Chart object.
 */
function createEmptyChart(ctx) {
    return new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: []
        },
        options: {
            scales: {
                x: {
                    type: 'logarithmic',
                    position: 'bottom',
                    min: 0,
                    max: 0,
                    title: {
                        display: true,
                        text: 'Payload (kg)'
                    }
                },
                y: {
                    type: 'logarithmic',
                    position: 'left',
                    min: 0,
                    max: 0,
                    title: {
                        display: true,
                        text: 'Reach (mm)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (tooltipItem) => {
                            return tooltipItem.chart.data.datasets[tooltipItem.datasetIndex].data[tooltipItem.dataIndex].name;
                        },
                        afterFooter: function (chart) {
                            document.getElementById('IRBName').innerHTML = chart[chart.length - 1].dataset.data[0].name;
                            document.getElementById('image').setAttribute('src', "assets/img/" + chart[chart.length - 1].dataset.data[0].product_thumb);
                            document.getElementById('descr').innerHTML = chart[chart.length - 1].dataset.data[0].description;
                            document.getElementById('More').setAttribute('href', chart[chart.length - 1].dataset.data[0].read_more_url);
                            document.getElementById('More').innerHTML = "Learn more...";
                            document.getElementById('color').setAttribute('style', "background-color:" + chart[chart.length - 1].dataset.data[0].random_color);
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Creates a robot point on specified chart.
 * 
 * @param {object} robot - Robot object.
 * @param {Chart} chart - Chart object.
 * @param {number} nbTotal - Total number of robots of specified type.
 * @param {number} nbActual - Actual number of robots of specified type.
 */
function createRobotVariantPoints(chart, robot, nbTotal, nbActual) {
    chart.data.datasets.push({
        label: "Robots",
        data: [],
        backgroundColor: 'rgb(20, 20, 20)',
        showLine: true,
        borderColor: function (context) {
            return context.dataset.data[0].random_color;
        },
        pointBackgroundColor: function (context) {
            return context.dataset.data[0].random_color;
        },
        pointRadius: function (context) {
            if (context.dataset.data[0].show) {
                return 4;
            } else {
                return 0;
            }
        },
        borderWidth: function (context) {
            if (context.dataset.data[0].show) {
                return 2;
            } else {
                return 0;
            }
        }
    });
    let randomColor = `hsl(${Math.floor((nbActual / nbTotal) * 180) * (nbActual % 2) + Math.floor(180 + ((nbActual + 1) / nbTotal) * 180) * ((nbActual + 1) % 2)},100%,60%)`;
    robot.variants.forEach(variant => {
        chart.data.datasets[chart.data.datasets.length - 1].data.push({
            y: variant.reach * 1000,
            x: variant.capacity,
            name: variant.name,
            product_thumb: robot.product_thumb,
            description: robot.description,
            read_more_url: robot.read_more_url,
            random_color: randomColor,
            controller: robot.controller,
            show: true
        });
    });
}


/**
 * Resizes specified chart based on data.
 * 
 * @param {Chart} chart - Chart object.
 * @returns {Chart} - Resized chart object.
 */
function getResizedChart(chart) {
    let minReach = Infinity;
    let minPayload = Infinity;
    let maxReach = -Infinity;
    let maxPayload = -Infinity;
    chart.data.datasets.forEach(dataset => {
        dataset.data.forEach(data => {
            minReach = Math.min(minReach, data.y * 0.9);
            minPayload = Math.min(minPayload, data.x * 0.9);
            maxReach = Math.max(maxReach, data.y * 2);
            maxPayload = Math.max(maxPayload, data.x * 2);
        });
    });
    chart.options.scales.y.min = minReach;
    chart.options.scales.x.min = minPayload;
    chart.options.scales.y.max = maxReach;
    chart.options.scales.x.max = maxPayload;
    chart.update();
    return chart;
}

/**
 * Returns the number of robots of specified type.
 * 
 * @param {String} type  - Type of sorting. Can be "payload" or "reach".
 * @param {String} json - JSON object to sort.
 * @returns 
 */
function getNumberOfRobotsByType(type, json) {
    return json.items.filter(item => item.product_type === type || (type === "Palletizer" && ["IRB 460", "IRB 760", "IRB 660"].includes(item.product_name))).length;
}

/**
 * Open specified tab.
 * 
 * @param {Event} evt - Event object.
 * @param {String} robotType - Type of robot.
 * @returns
 */
function openTypeTab(evt, robotType) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(robotType).style.display = "block";
    evt.currentTarget.className += " active";
}

/**
 * Filters robots based on selected checkbox and update charts accordingly.
 * 
 * @returns
 * 
 */
function filterByController() {
    const irc5Checked = document.getElementById("IRC5_checkbox").checked;
    const omnicoreChecked = document.getElementById("Omnicore_checkbox").checked;

    charts.forEach(chart => {
        chart.data.datasets.forEach(dataset => {
            dataset.data.forEach(data => {
                let show = false;
                if (irc5Checked && omnicoreChecked) {
                    show = true;
                } else if (!irc5Checked && omnicoreChecked) {
                    show = data.controller.some(controller => controller.includes("OmniCore"));
                } else if (irc5Checked && !omnicoreChecked) {
                    show = data.controller.some(controller => controller.includes("IRC5"));
                }
                data.show = show;
            });
        });
        chart.update();
    });
}

/**
 * 
 * Returns a sorted JSON with variants sorted by specified string : "payload" or "reach".
 * 
 * @param {JSON} json - JSON object to sort.
 * @param {String} byString - String to sort by. Can be "payload" or "reach".
 * @returns {JSON} - Sorted JSON object.
 * 
 */
function getJsonVariantSorted(json, byString = "payload") {
    const sortFunction = (a, b) => {
        if (a[byString] < b[byString]) {
            return -1;
        } else if (a[byString] > b[byString]) {
            return 1;
        } else {
            if (a.capacity < b.capacity) {
                return -1;
            } else if (a.capacity > b.capacity) {
                return 1;
            } else {
                return 0;
            }
        }
    };
    json.items.forEach(item => {
        item.variants.sort(sortFunction);
    });
    return json;
}

document.getElementById("defaultOpen").click();