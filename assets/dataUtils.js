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