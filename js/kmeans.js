var margin = 40,
    width = 960 - 2 * margin,
    height = 500 - 2 * margin;
var colorArray;
var animationTime = 500;
var animatingCentroids = false;
var animatingPoints = false;
var dataKey = function(d) {
    return d.id + "" + d.cluster;
};

var xValue = function(d) {
        return d.x;
    },
    xScale = d3.scale.linear().range([0, width]),
    xMap = function(d) {
        return xScale(xValue(d));
    },
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

var yValue = function(d) {
        return d.y;
    },
    yScale = d3.scale.linear().range([height, 0]),
    yMap = function(d) {
        return yScale(yValue(d));
    },
    yAxis = d3.svg.axis().scale(yScale).orient("left");

var svg = d3.select("#graph")
    .attr("width", width + margin + margin)
    .attr("height", height + margin + margin)
    .append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")");

xScale.domain([-10, 10]);
yScale.domain([-10, 10]);

var xAxisBar = svg.append("g")
    .attr("class", "x axis")
    .attr("id", "xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text("x");

var yAxisBar = svg.append("g")
    .attr("class", "y axis")
    .attr("id", "yaxis")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("y");

var title = svg.append("text")
    .attr("id", "title")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("K-Means");

var tooltip = d3.select(".tooltip");

function adjustAxes(data) {
    // don't want dots overlapping axis, so add in buffer to data domain
    var minX = d3.min(data, xValue),
        maxX = d3.max(data, xValue),
        minY = d3.min(data, yValue),
        maxY = d3.max(data, yValue);

    xScale.domain([minX, maxX]);
    yScale.domain([minY, maxY]);

    xAxisBar.transition()
        .duration(animationTime)
        .ease("sin-in-out")
        .call(xAxis);

    yAxisBar.transition()
        .duration(animationTime)
        .ease("sin-in-out")
        .call(yAxis);
}

function createTestData() {
    var minX = parseFloat($("#minXInput").val()),
        maxX = parseFloat($("#maxXInput").val()),
        minY = parseFloat($("#minYInput").val()),
        maxY = parseFloat($("#maxYInput").val()),
        sampleSize = parseInt($("#sampleSizeInput").val()),
        maxK = parseInt($("#maxKInput").val()),
        rangeX = maxX - minX,
        rangeY = maxY - minY,
        points = [];
    for (var i = 0; i < sampleSize; i++) {
        var x = Math.round((Math.random() * rangeX * 100.0) + (minX * 100.0)) / 100.0;
        var y = Math.round((Math.random() * rangeY * 100.0) + (minY * 100.0)) / 100.0;
        points[i] = "(" + x + "," + y + ")";
    };
    $('#dataEntryField').val(points);
    $('#kValue').val(Math.round((Math.random() * (maxK - 1)) + 1));
    $('#startButton').removeAttr("disabled");
    $('#dataModal').modal('hide');
}

function checkForInput() {
    if (!($('#dataEntryField').val() && $("#kValue").val())) {
        $('#startButton').attr("disabled", "disabled");
    } else {
        $('#startButton').removeAttr("disabled");
    }
}

function updateTitle(text) {
    if (text != undefined)
        title.text("K-Means" + text);
    else
        title.text("K-Means");
}

function kMeans(data, centroids, iteration) {
    var pointsChanged = false;
    for (var i = 0; i < data.length; i++) {
        var min_distance = Number.MAX_SAFE_INTEGER;
        var closest_cluster = -1;
        var point = data[i];
        for (var j = 0; j < centroids.length; j++) {
            var centroid = centroids[j];
            var distance = Math.sqrt(Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2));
            if (distance < min_distance) {
                min_distance = distance;
                closest_cluster = j;
            }
        }
        if (closest_cluster != data[i].cluster) {
            data[i].cluster = closest_cluster;
            pointsChanged = true;
        }
    }
    centroids = computeCentroids(data, centroids.length);
    if (!animatingPoints && !animatingCentroids) {
        updateTitle(": Iteration #" + (iteration + 1));
        drawPoints(data);
        drawCentroids(centroids, false);
    }
    if (pointsChanged) {
        setTimeout(function() {
            kMeans(data, centroids, iteration + 1);
        }, 100);
    } else {
        updateTitle();
        drawPoints(data);
        drawCentroids(centroids);
    }
}

function computeCentroids(data, k) {
    var centroids = []
    for (var i = 0; i < k; i++) {
        centroids[i] = {};
        centroids[i].x = 0.0;
        centroids[i].y = 0.0;
        centroids[i].size = 0;
    }
    for (var i = 0; i < data.length; i++) {
        var point = data[i];
        centroids[point.cluster].x += point.x;
        centroids[point.cluster].y += point.y;
        centroids[point.cluster].size++;
    }
    for (var i = 0; i < k; i++) {
        if (centroids[i].size == 0) {
            centroids[i] = data[Math.floor(Math.random() * data.length)];
        } else {
            centroids[i].x = centroids[i].x / centroids[i].size;
            centroids[i].y = centroids[i].y / centroids[i].size;
        }
        centroids[i].cluster = i;
    }
    return centroids;
}

function nRandomNumbers(n, high) {
    var arr = []
    while (arr.length < n) {
        var randomnumber = Math.ceil(Math.random() * high)
        var found = false;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == randomnumber) {
                found = true;
                break;
            }
        }
        if (!found) arr[arr.length] = randomnumber;
    }
    return arr;
}

function startKmeans() {
    var textdata = $("#dataEntryField").val();
    textdata = textdata.split("),(");
    textdata[0] = textdata[0].replace("(", "");
    textdata[textdata.length - 1] = textdata[textdata.length - 1].replace(")", "");
    var k = parseInt($('#kValue').val());
    colorArray = nRandomColors(k);
    var data = [];
    for (var i = textdata.length - 1; i >= 0; i--) {
        var textpoints = textdata[i].split(",");
        data[i] = {};
        data[i].x = parseFloat(textpoints[0]);
        data[i].y = parseFloat(textpoints[1]);
        data[i].cluster = 0;
        data[i].id = i;
    };
    svg.selectAll(".dot").remove();
    svg.selectAll(".centroid").remove();
    adjustAxes(data);
    var centroids = [];
    var randomArr = nRandomNumbers(k, data.length);
    for (var i = randomArr.length - 1; i >= 0; i--) {
        centroids[i] = data[randomArr[i]];
    };
    kMeans(data, centroids, 0);
}

function drawCentroids(centroids) {
    var dataCentroids = svg.selectAll(".centroid").data(centroids);
    var svgOffset = $("#graph").offset();
    dataCentroids.enter().append("circle")
        .attr("style", "stroke: #000;")
        .attr("class", "centroid")
        .attr("r", 8)
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Position: (" + d.x.toFixed(3) + ", " + d.y.toFixed(3) + ")<br>Cluster Size: "+d.size)
                .style("left", (xMap(d) + svgOffset.left) + "px")
                .style("top", (yMap(d) + svgOffset.top - 40 /*For the header*/ ) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    dataCentroids.transition().duration(animationTime)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) {
            return colorArray[d.cluster];
        }).each("end", function(d, i) {
            if (i + 1 == centroids.length) {
                animatingCentroids = false;
            }
        });
    dataCentroids.exit().remove();
    animatingCentroids = true;
}

function drawPoints(data) {
    var dataPoints = svg.selectAll(".dot").data(data, dataKey);
    dataPoints
        .enter().append("circle")
        .attr("style", "stroke: #000;")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .attr("id", function(d) {
            return d.id;
        });
    dataPoints.transition().duration(animationTime).style("fill", function(d, i) {
        return colorArray[data[d.id].cluster];
    }).each("end", function(d, i) {
        if (i + 1 == data.length) {
            animatingPoints = false;
        }
    });
    dataPoints.exit().remove();
    animatingPoints = true;
}
