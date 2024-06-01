function createEmptyChart(ctx) {
    const chartOptions = {
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
                        text: 'Reach (m)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: tooltipItem => { return getTooltipLabel(tooltipItem) },
                        afterFooter: chart => { return afterFooterCallback(chart) }
                    }
                },
                legend: {
                    display: false
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy'
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy'
                    }
                }
            },
            maintainAspectRatio: false
        }
    };
    return new Chart(ctx, chartOptions);
}

function getTooltipLabel(tooltipItem) {
    return tooltipItem.chart.data.datasets[tooltipItem.datasetIndex].data[tooltipItem.dataIndex].name;
}

function afterFooterCallback(chart) {
    const dataset = chart[0].dataset;
    const data = dataset.data[chart[0].dataIndex];
    document.getElementById('IRBName').innerHTML = data.name;
    document.getElementById('image').setAttribute('src', "assets/img/" + data.product_thumb);
    document.getElementById('descr').innerHTML = data.description;
    document.getElementById('More').setAttribute('href', data.read_more_url);
    document.getElementById('More').innerHTML = "Learn more...";
    document.getElementById('color').setAttribute('style', "background-color:" + data.random_color);
    // in div with id supported_controllers, create for each controller a div with class controller_supported with the name of the controller in valie
    document.getElementById('supported_controllers').innerHTML = "";
    data.controller.forEach(controller => {
        let div = document.createElement('div');
        div.setAttribute('class', 'controller_supported');
        // use the dict controllers to get the display name
        div.innerHTML = controllers[controller];
        document.getElementById('supported_controllers').appendChild(div);
    }
    );
}

function createRobotPoints(chart, robot, populationSize, index) {
    const newRobotDataset = {
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
    }
    chart.data.datasets[index] = newRobotDataset;
    let colors = generateDistinctColors(populationSize);
    let randomColor = colors[index];
    robot.variants.forEach(variant => {
        chart.data.datasets[chart.data.datasets.length - 1].data.push({
            y: variant.reach,
            x: variant.capacity,
            name: variant.name,
            product_thumb: robot.product_thumb,
            description: robot.description,
            read_more_url: robot.read_more_url,
            random_color: randomColor,
            controller: robot.controller,
            product_name: robot.product_name,
            show: localStorage.getItem(robot.product_name) !== null ? localStorage.getItem(robot.product_name) === "true" : true
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
            maxReach = Math.max(maxReach, data.y * 1.2);
            maxPayload = Math.max(maxPayload, data.x * 1.2);
        });
    });
    chart.options.scales.y.min = minReach;
    chart.options.scales.x.min = minPayload;
    chart.options.scales.y.max = maxReach;
    chart.options.scales.x.max = maxPayload;
    return chart;
}