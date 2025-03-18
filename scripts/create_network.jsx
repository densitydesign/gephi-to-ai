function readJSON(filePath) {
    var jsonFile = new File(filePath);
    if (!jsonFile.exists) {
        alert("File not found: " + filePath);
        return null;
    }
    jsonFile.open("r");
    var content = jsonFile.read();
    jsonFile.close();
    return eval('(' + content + ')'); // Use eval() to parse JSON (ExtendScript-compatible)
}

function createNetworkFromJSON(jsonData) {
    var doc = app.documents.add();
    var nodes = jsonData.nodes;
    var edges = jsonData.edges || jsonData.links || []; // Check for edges under different keys
    var scale = 0.1; // Scale factor to fit Illustrator's canvas

    var nodesGroup = doc.groupItems.add();
    nodesGroup.name = "Nodes";

    var labelsGroup = doc.groupItems.add();
    labelsGroup.name = "Labels";

    var edgesGroup = doc.groupItems.add();
    edgesGroup.name = "Edges";

    var nodePositions = {}; // Store node positions for quick lookup

    // Create nodes
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var attributes = node.attributes;

        var x = attributes.x * scale;
        var y = -attributes.y * scale; // Invert y-axis for Illustrator

        nodePositions[node.key] = { x: x, y: y }; // Store position for edges

        var size = attributes.size * scale;

        var color = new RGBColor();
        color.red = parseInt(attributes.color.substring(1, 3), 16);
        color.green = parseInt(attributes.color.substring(3, 5), 16);
        color.blue = parseInt(attributes.color.substring(5, 7), 16);

        var circle = nodesGroup.pathItems.ellipse(y + size / 2, x - size / 2, size, size);
        circle.fillColor = color;
        circle.stroked = false;

        if (attributes.size > 50) {
            var textItem = labelsGroup.textFrames.add();
            textItem.contents = attributes.Label_backup;
            textItem.position = [x, y];
            textItem.textRange.characterAttributes.size = 8;
        }
    }

    // Create edges
    for (var j = 0; j < edges.length; j++) {
        var edge = edges[j];
        var source = nodePositions[edge.source];
        var target = nodePositions[edge.target];

        if (source && target) {
            var line = edgesGroup.pathItems.add();
            line.setEntirePath([[source.x, source.y], [target.x, target.y]]);
            line.stroked = true;
            line.strokeWidth = 0.5;
            line.strokeColor = new GrayColor(); // Set edge color to gray
        }
    }
}

var filePath = File.openDialog("Select JSON file");
if (filePath) {
    var jsonData = readJSON(filePath.fsName);
    if (jsonData) {
        createNetworkFromJSON(jsonData);
    }
}
