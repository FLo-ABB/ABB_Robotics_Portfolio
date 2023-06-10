let charts = [get_robots_chart('myChartArticulated', "Articulated"), get_robots_chart('myChartPalletizer', "Palletizer"), get_robots_chart('myChartSCARA', "SCARA"), get_robots_chart('myChartPicker', "Parallel"), get_robots_chart('myChartPaint', "Paint"), get_robots_chart('myChartCollaborative', "Collaboratives")];

function get_robots_chart(IdDiv, product_type) {
    let nbTotal = get_number_by_type(product_type);
    let nbActual = 0;
    const ctx = document.getElementById(IdDiv).getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: "Robots",
                data: [],
                backgroundColor: 'rgb(20, 20, 20)',
                pointBackgroundColor: function (context) {
                    let index = context.dataIndex;
                    if (typeof context.dataset.data[index] !== 'undefined') {
                        return context.dataset.data[index].random_color;
                    }
                },
                pointRadius: function (context) {
                    let index = context.dataIndex;
                    if (typeof context.dataset.data[index] !== 'undefined') {
                        if (context.dataset.data[index].show) {
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
    myJson.items.filter(item => item.product_type === product_type || (product_type === "Palletizer" && ["IRB 460", "IRB 760", "IRB 660"].includes(item.product_name)))
    .forEach(item => {
        create_robot_point(item, myChart, nbTotal, nbActual);
        nbActual++;
    });
    return resized_chart(myChart);
}

function create_robot_point(robot, chart, nb_total, nb_actual) {
    let randomColor = `hsl(${Math.floor((nb_actual / nb_total) * 180) * (nb_actual % 2) + Math.floor(180 + ((nb_actual + 1) / nb_total) * 180) * ((nb_actual + 1) % 2)},100%,60%)`;
    robot.variants.forEach(variant => {
        chart.data.datasets[0].data.push({
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

function resized_chart(chart) {
    let minReach = 0;
    let minPayload = 0;
    let maxReach = 0;
    let maxPayload = 0;
    for (let data of chart.data.datasets[0].data) {
        if ((minReach == 0) || (minReach >= data.y))  minReach = data.y * .9;
        if ((minPayload == 0) || (minPayload >= data.x))  minPayload = data.x * .9;
        if ((maxReach == 0) || (maxReach <= data.y)) maxReach = data.y * 2;
        if ((maxPayload == 0) || (maxPayload <= data.x))  maxPayload = data.x * 2;
    }
    chart.options.scales.y.min = minReach;
    chart.options.scales.x.min = minPayload;
    chart.options.scales.y.max = maxReach;
    chart.options.scales.x.max = maxPayload;
    chart.update();
    return chart;
}

function get_number_by_type(type) {
    return myJson.items.filter(item => item.product_type === type || (type === "Palletizer" && ["IRB 460", "IRB 760", "IRB 660"].includes(item.product_name))).length;
}

function open_type_tab(evt, robotType) {
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

function filter_controller() {
    const irc5Checked = document.getElementById("IRC5_checkbox").checked;
    const omnicoreChecked = document.getElementById("Omnicore_checkbox").checked;
    
    charts.forEach(chart => {
      chart.data.datasets[0].data.forEach(data => {
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
      chart.update();
    });
  }

document.getElementById("defaultOpen").click();