function openTypeTab(evt, robotType) {
    const tabcontent = Array.from(document.getElementsByClassName("chart-container"));
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

function toggleMenu() {
    const hamburger = document.getElementById("hamburger");
    hamburger.innerHTML = (hamburger.innerHTML === "☰") ? "✕" : "☰";

    const navigationBar = document.getElementById("navigation-bar");
    navigationBar.style.display = (navigationBar.style.display === "flex") ? "none" : "flex";
}

function toggleRobot(robot) {
    charts.forEach(chart => {
        chart.data.datasets.forEach(dataset => {
            dataset.data.forEach(data => {
                console.log(data, robot.value);
                if (data.product_name === robot.value) {
                    data.show = robot.checked;
                }
            });
        });
        chart.update();
    });
}