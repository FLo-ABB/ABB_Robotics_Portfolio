function getNumberOfRobotsByType(type, json) {
    return json.items.filter(item => item.product_type === type || (type === "Palletizer" && ["IRB 460", "IRB 760", "IRB 660"].includes(item.product_name))).length;
}

function getJsonVariantSorted(json, sortBy = "payload") {
    const sortProperty = sortBy === "payload" ? "capacity" : "reach";
    json.items.forEach(item => {
        item.variants.sort((a, b) => (a[sortProperty] - b[sortProperty]));
    });
    return json;
}

function addRobotInSecretTools(robot) {
    const secretToolsDiv = document.getElementById("secret-tools");
    const div = document.createElement("div");
    div.setAttribute("class", "robot-checkbox");
    const input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("id", robot.product_name);
    input.setAttribute("name", robot.product_name);
    input.setAttribute("value", robot.product_name);
    input.setAttribute("checked", "checked");
    input.setAttribute("onchange", "toggleRobot(this)");
    input.checked = localStorage.getItem(robot.product_name) !== null ? localStorage.getItem(robot.product_name) === "true" : true;
    input.addEventListener("change", handleCheckboxChange(robot));
    div.appendChild(input);
    const label = document.createElement("label");
    label.setAttribute("for", robot.product_name);
    label.innerHTML = robot.product_name;
    div.appendChild(label);
    secretToolsDiv.appendChild(div);
}

function handleCheckboxChange(robot) {
    return function () {
        localStorage.setItem(robot.product_name, this.checked);
        const checkboxes = document.querySelectorAll('#secret-tools input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        document.getElementById('selectAll').checked = allChecked;
    };
}
