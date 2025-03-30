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
    "OmniCore\u2122\ufe0f V250XT": "OmniCore V250XT",
    "OmniCore\u2122\ufe0f C30": "OmniCore C30",
    "OmniCore\u2122\ufe0f E10": "OmniCore E10",
    "OmniCore\u2122\ufe0f C90XT": "OmniCore C90XT",
    "OmniCore\u2122\ufe0f V400XT": "OmniCore V400XT"
};

function getRobotChart(chartId, productType) {
    const chartContext = document.getElementById(chartId).getContext('2d');
    const actualChart = createEmptyChart(chartContext);
    const sortedJson = getJsonVariantSorted(myJson, "payload");
    const filteredRobots = sortedJson.items.filter(robot => ((robot.product_type === productType) && !["IRB 460", "IRB 760", "IRB 660"].includes(robot.product_name)) || (productType === "Palletizer" && ["IRB 460", "IRB 760", "IRB 660"].includes(robot.product_name)));
    filteredRobots.forEach((robot, index) => {
        createRobotPoints(actualChart, robot, getNumberOfRobotsByType(productType, myJson), index);
        addRobotInSecretTools(robot);
    });
    document.getElementById('selectAll').addEventListener('change', function () {
        const checkboxes = document.querySelectorAll('#secret-tools input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
            localStorage.setItem(checkbox.name, this.checked);
        });
    });
    const resizedChart = getResizedChart(actualChart);
    resizedChart.update();
    return resizedChart;
}

document.getElementById("defaultOpen").click();