let charts = [get_robots_chart('myChartArticulated', "Articulated"), get_robots_chart('myChartPalletizer', "Palletizer"), get_robots_chart('myChartSCARA', "SCARA"), get_robots_chart('myChartPicker', "Parallel"), get_robots_chart('myChartPaint', "Paint"), get_robots_chart('myChartCollaborative', "Collaboratives")];

function get_robots_chart(IdDiv, product_type) {
    let nbTotal = get_number_by_type(product_type, myJson);
    let nbActual = 0;
    const ctx = document.getElementById(IdDiv).getContext('2d');
    const myChart = new Chart(ctx, {
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
                            return myChart.data.datasets[tooltipItem.datasetIndex].data[tooltipItem.dataIndex].name;
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
    let json_sorted = get_Json_variant_sorted(myJson, "payload");
    json_sorted.items.filter(item => ((item.product_type === product_type) && !["IRB 460", "IRB 760", "IRB 660"].includes(item.product_name)) || (product_type === "Palletizer" && ["IRB 460", "IRB 760", "IRB 660"].includes(item.product_name)))
        .forEach(item => {
            create_robot_point(item, myChart, nbTotal, nbActual);
            nbActual++;
        });
    return resized_chart(myChart);
}

function create_robot_point(robot, chart, nb_total, nb_actual) {
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
    let randomColor = `hsl(${Math.floor((nb_actual / nb_total) * 180) * (nb_actual % 2) + Math.floor(180 + ((nb_actual + 1) / nb_total) * 180) * ((nb_actual + 1) % 2)},100%,60%)`;
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

function resized_chart(chart) {
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

function get_number_by_type(type, json) {
    return json.items.filter(item => item.product_type === type || (type === "Palletizer" && ["IRB 460", "IRB 760", "IRB 660"].includes(item.product_name))).length;
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

function get_Json_variant_sorted(json, byString = "payload") {
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