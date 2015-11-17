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
    if (iteration % 10 == 0) {
        drawPoints(data);
        drawCentroids(centroids, false);
    }
    if (pointsChanged) {
        setTimeout(function() {
            kMeans(data, centroids, iteration + 1);
        }, 100);
    } else {
        drawPoints(data);
        drawCentroids(centroids, true);
    }
}

function computeCentroids(data, k) {
    centroids = []
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
    adjustAxes(data);
    var centroids = [];
    var randomArr = nRandomNumbers(k, data.length);
    for (var i = randomArr.length - 1; i >= 0; i--) {
        centroids[i] = data[randomArr[i]];
    };
    kMeans(data, centroids, 0);
}

function drawCentroids(centroids, overloadAnimation) {
    if (overloadAnimation || !animatingCentroids) {
        var dataCentroids = svg.selectAll(".centroid").data(centroids);
        dataCentroids.enter().append("circle")
            .attr("class", "centroid")
            .attr("r", 8);
        dataCentroids.transition().duration(animationTime)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", function(d) {
                var color = colorArray[d.cluster];
                return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
            }).each("end", function(d, i) {
                if (i + 1 == centroids.length) {
                    animatingCentroids = false;
                }
            });
        dataCentroids.exit().remove();
        animatingCentroids = true;
    }
}

function drawPoints(data, overloadAnimation) {
    if (overloadAnimation || !animatingPoints) {
        var dataPoints = svg.selectAll(".dot").data(data, dataKey);
        dataPoints
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .attr("id", function(d) {
                return d.id;
            });
        dataPoints.transition().duration(animationTime).style("fill", function(d, i) {
            var color = colorArray[data[d.id].cluster];
            var colorFill = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
            return colorFill;
        }).each("end", function(d, i) {
            if (i + 1 == data.length) {
                animatingPoints = false;
            }
        });
        dataPoints.exit().remove();
        animatingPoints = true;
    }
}
