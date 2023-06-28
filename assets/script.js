const charts = [
    getRobotChart('myChartArticulated', "Articulated"),
    getRobotChart('myChartPalletizer', "Palletizer"),
    getRobotChart('myChartSCARA', "SCARA"),
    getRobotChart('myChartPicker', "Parallel"),
    getRobotChart('myChartPaint', "Paint"),
    getRobotChart('myChartCollaborative', "Collaboratives")
];

const controllers = {
    "IRC5 Compact": "IRC5 Compact",
    "IRC5 Panel Mounted Controller": "IRC5 PMC",
    "IRC5 Single Cabinet": "IRC5 Single",
    "OmniCore V250XT": "OmniCore V250XT",
    "OmniCore C30": "OmniCore C30",
    "OmniCore E10": "OmniCore E10",
    "OmniCore C90XT": "OmniCore C90XT"
};


function getRobotChart(chartId, productType) {
    const chartContext = document.getElementById(chartId).getContext('2d');
    const actualChart = createEmptyChart(chartContext);
    const sortedJson = getJsonVariantSorted(myJson, "payload");
    const filteredRobots = sortedJson.items.filter(robot => ((robot.product_type === productType) && !["IRB 460", "IRB 760", "IRB 660"].includes(robot.product_name)) || (productType === "Palletizer" && ["IRB 460", "IRB 760", "IRB 660"].includes(robot.product_name)));
    filteredRobots.forEach((robot, index) => {
        createRobotVariantPoints(actualChart, robot, getNumberOfRobotsByType(productType, myJson), index);
    });
    const resizedChart = getResizedChart(actualChart);
    resizedChart.update();
    return resizedChart;
}

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
                    title: {
                        display: true,
                        text: 'Payload (kg)'
                    }
                },
                y: {
                    type: 'logarithmic',
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
                            document.getElementById('IRBName').innerHTML = chart[0].dataset.data[chart[0].dataIndex].name;
                            document.getElementById('image').setAttribute('src', "assets/img/" + chart[0].dataset.data[chart[0].dataIndex].product_thumb);
                            document.getElementById('descr').innerHTML = chart[0].dataset.data[chart[0].dataIndex].description;
                            document.getElementById('More').setAttribute('href', chart[0].dataset.data[chart[0].dataIndex].read_more_url);
                            document.getElementById('More').innerHTML = "Learn more...";
                            document.getElementById('color').setAttribute('style', "background-color:" + chart[0].dataset.data[chart[0].dataIndex].random_color);
                            // in div with id supported_controllers, create for each controller a div with class controller_supported with the name of the controller in valie
                            document.getElementById('supported_controllers').innerHTML = "";
                            chart[0].dataset.data[chart[0].dataIndex].controller.forEach(controller => {
                                let div = document.createElement('div');
                                div.setAttribute('class', 'controller_supported');
                                // use the dict controllers to get the display name
                                div.innerHTML = controllers[controller];
                                document.getElementById('supported_controllers').appendChild(div);
                            }
                            );


                        }
                    }
                },
                legend: {
                    display: false
                },
                zoom: {
                    zoom: {
                      wheel: {
                        enabled: true,
                      },
                      pinch: {
                        enabled: true
                      },
                      mode: 'xy',
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy',
                    }
                  }
            }
        }
    });
}

function createRobotVariantPoints(chart, robot, populationSize, index) {
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
            return context.dataset.data[0].show ? 3 : 0;
        },
        borderWidth: function (context) {
            return context.dataset.data[0].show ? 2 : 0;
        },
        lineTension: 0.3
    });
    let colors = generateDistinctColors(populationSize);
    let randomColor = colors[index];
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
    return chart;
}

function getNumberOfRobotsByType(type, json) {
    return json.items.filter(item => item.product_type === type || (type === "Palletizer" && ["IRB 460", "IRB 760", "IRB 660"].includes(item.product_name))).length;
}

function openTypeTab(evt, robotType) {
    const tabcontent = Array.from(document.getElementsByClassName("tabcontent"));
    tabcontent.forEach(tab => { tab.style.display = "none"; });
    const tablinks = Array.from(document.getElementsByClassName("tablinks"));
    tablinks.forEach(tablink => { tablink.className = tablink.className.replace(" active", ""); });
    document.getElementById(robotType).style.display = "block";
    evt.currentTarget.className += " active";
}

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

function resetZoom() {
    charts.forEach(chart => {
        chart.resetZoom();
    });
}

function getJsonVariantSorted(json, sortBy = "payload") {
    const sortProperty = sortBy === "payload" ? "capacity" : "reach";
    json.items.forEach(item => {
        item.variants.sort((a, b) => (a[sortProperty] - b[sortProperty]));
    });
    return json;
}

document.getElementById("defaultOpen").click();