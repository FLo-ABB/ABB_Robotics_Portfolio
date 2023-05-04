charts = [];

function robotsChart(IdDiv, product_type) {
    let minReach = 0;
    let maxReach = 0;
    let minPayload = 0;
    let maxPayload = 0;
    const ctx = document.getElementById(IdDiv).getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: "Robots",
                data: [],
                backgroundColor: 'rgb(20, 20, 20)',
                pointBackgroundColor: function (context) {
                    var index = context.dataIndex;
                    if (typeof context.dataset.data[index] !== 'undefined') {
                        return context.dataset.data[index].random_color;
                    }
                },
                pointRadius: function (context) {
                    var index = context.dataIndex;
                    if (typeof context.dataset.data[index] !== 'undefined') {
                        if (context.dataset.data[index].show == true) {
                            return 5;
                        } else {
                            return 0;
                        }

                    }
                },
            }]
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
                            return myChart.data.datasets[0].data[tooltipItem.dataIndex].name;
                        },
                        afterFooter: function (chart) {
                            document.getElementById('IRBName').innerHTML = myChart.data.datasets[0].data[chart[chart.length - 1].dataIndex].name;
                            document.getElementById('image').setAttribute('src', "assets/img/" + myChart.data.datasets[0].data[chart[chart.length - 1].dataIndex].product_thumb);
                            document.getElementById('descr').innerHTML = myChart.data.datasets[0].data[chart[chart.length - 1].dataIndex].description;
                            document.getElementById('More').setAttribute('href', myChart.data.datasets[0].data[chart[chart.length - 1].dataIndex].read_more_url);
                            document.getElementById('More').innerHTML = "Learn more...";
                            document.getElementById('color').setAttribute('style', "background-color:" + myChart.data.datasets[0].data[chart[chart.length - 1].dataIndex].random_color);
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
    charts.push(myChart);
    // Color Management
    let nbTotal = 0;
    let nbActual = 0;
    for (let index = 0; index < myJson.items.length; index++) {
        if ((myJson.items[index].product_type == product_type)) {
            if (product_type == "Articulated") {
                if (!(myJson.items[index].product_name == "IRB 460") && !(myJson.items[index].product_name == "IRB 760") && !(myJson.items[index].product_name == "IRB 660")) {
                    nbTotal++
                }
            } else if (!(product_type == "Palletizer")) {
                nbTotal++
            }
        }
        if (product_type == "Palletizer") {
            if ((myJson.items[index].product_name == "IRB 460") || (myJson.items[index].product_name == "IRB 760") || (myJson.items[index].product_name == "IRB 660")) {
                nbTotal++
            }
        }
    }
    for (let index = 0; index < myJson.items.length; index++) {
        if ((myJson.items[index].product_type == product_type)) {
            randomColor = Math.floor((nbActual / nbTotal) * 180) * (nbActual % 2) + Math.floor(180 + ((nbActual + 1) / nbTotal) * 180) * ((nbActual + 1) % 2);
            randomColor = "hsl(" + randomColor + ",100%,60%)";
            if (!(myJson.items[index].product_name == "IRB 460") && !(myJson.items[index].product_name == "IRB 760") && !(myJson.items[index].product_name == "IRB 660")) {
                for (let index2 = 0; index2 < myJson.items[index].variants.length; index2++) {
                    myChart.data.datasets[0].data.push({
                        y: myJson.items[index].variants[index2].reach * 1000,
                        x: myJson.items[index].variants[index2].capacity,
                        name: myJson.items[index].variants[index2].name,
                        product_thumb: myJson.items[index].product_thumb,
                        description: myJson.items[index].description,
                        read_more_url: myJson.items[index].read_more_url,
                        random_color: randomColor,
                        controller: myJson.items[index].controller,
                        show: true
                    });
                }
            }
            if (product_type == "Articulated") {
                if (!(myJson.items[index].product_name == "IRB 460") && !(myJson.items[index].product_name == "IRB 760") && !(myJson.items[index].product_name == "IRB 660")) {
                    nbActual++;
                }
            } else if (!(product_type == "Palletizer")) {
                nbActual++;
            }
        }
        if (product_type == "Palletizer") {
            if ((myJson.items[index].product_name == "IRB 460") || (myJson.items[index].product_name == "IRB 760") || (myJson.items[index].product_name == "IRB 660")) {
                randomColor = Math.floor((nbActual / nbTotal) * 180) * (nbActual % 2) + Math.floor(180 + ((nbActual + 1) / nbTotal) * 180) * ((nbActual + 1) % 2);
                randomColor = "hsl(" + randomColor + ",100%,60%)";
                for (let index2 = 0; index2 < myJson.items[index].variants.length; index2++) {
                    myChart.data.datasets[0].data.push({
                        y: myJson.items[index].variants[index2].reach * 1000,
                        x: myJson.items[index].variants[index2].capacity,
                        name: myJson.items[index].variants[index2].name,
                        product_thumb: myJson.items[index].product_thumb,
                        description: myJson.items[index].description,
                        read_more_url: myJson.items[index].read_more_url,
                        random_color: randomColor,
                        controller: myJson.items[index].controller,
                        show: true
                    });
                }
                nbActual++;
            }
        }
    }


    for (let index = 0; index < myChart.data.datasets[0].data.length; index++) {
        if ((minReach == 0) || (minReach >= myChart.data.datasets[0].data[index].y)) minReach = myChart.data.datasets[0].data[index].y * .9;
        if ((minPayload == 0) || (minPayload >= myChart.data.datasets[0].data[index].x)) minPayload = myChart.data.datasets[0].data[index].x * .9;
        if ((maxReach == 0) || (maxReach <= myChart.data.datasets[0].data[index].y)) maxReach = myChart.data.datasets[0].data[index].y * 2;
        if ((maxPayload == 0) || (maxPayload <= myChart.data.datasets[0].data[index].x)) maxPayload = myChart.data.datasets[0].data[index].x * 2;
    }

    myChart.options.scales.y.min = minReach;
    myChart.options.scales.x.min = minPayload;
    myChart.options.scales.y.max = maxReach;
    myChart.options.scales.x.max = maxPayload;

    //Update the Chart
    myChart.update();
}

robotsChart('myChartArticulated', "Articulated");
robotsChart('myChartCollaborative', "Collaboratives");
robotsChart('myChartSCARA', "SCARA");
robotsChart('myChartPalletizer', "Palletizer");
robotsChart('myChartParallel', "Parallel");
robotsChart('myChartPaint', "Paint");

document.getElementById("defaultOpen").click();

function openRobotType(evt, robotType) {
    var i, tabcontent, tablinks;
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

function show_hide(checkbox) {
    charts.forEach(element => {
        element.data.datasets[0].data.forEach(subelement => {
            if (document.getElementById("IRC5_checkbox").checked && document.getElementById("Omnicore_checkbox").checked) {
                subelement.show = true;
            } else if (!document.getElementById("IRC5_checkbox").checked && document.getElementById("Omnicore_checkbox").checked) {
                omnicore_supported = false;
                subelement.controller.forEach(controller => {
                    if (controller.includes("OmniCore")) {
                        omnicore_supported = true;
                    }
                });
                if (omnicore_supported) {
                    subelement.show = true;
                } else {
                    subelement.show = false;
                }
            } else if (document.getElementById("IRC5_checkbox").checked && !document.getElementById("Omnicore_checkbox").checked) {
                irc5_supported = false;
                subelement.controller.forEach(controller => {
                    if (controller.includes("IRC5")) {
                        irc5_supported = true;
                    }
                });
                if (irc5_supported) {
                    subelement.show = true;
                } else {
                    subelement.show = false;
                }
            } else {
                subelement.show = false;
            }
        });
        element.update();
    });
}