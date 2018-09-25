// var parseDate = d3.timeParse("%Y");
var fullNames = [
    {key: "2002", value: "0"},
    {key: "2006", value:"10"},
    {key:"2007", value:"20"},
    {key:"2012", value:"30"},
    {key:"2014", value:"40"}
];

var durationTime = 300;


var margin = {top: 10, right: 10, bottom: 50, left: 50},
    // dim = Math.min(parseInt(d3.select("#scatter").style("width")), parseInt(d3.select("#scatter").style("height"))),
    // width = dim - margin.left - margin.right,
    // height = dim - margin.top - margin.bottom;
    box = $('#chart')[0].getBoundingClientRect();

var width, height;

if (box.height < box.width){
        width = box.height * 1.3,
        height = box.height;
}
if (box.height > box.width){
        width = box.width,
        height = box.width;
     $('#chart').css("height", height);
}

    
$("#slider").css("width", width).css("margin-left", margin.left);
var color = d3.scale.category10();

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .innerTickSize(-height)
    .outerTickSize(-height);


var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .innerTickSize(-width)
    .outerTickSize(-width);

var svg = d3.select("#scatter")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return d.rayon + ", " + d.region});

svg.call(tip);


$("#mySlider").css("width", width);
var step = width / 4;
$("#tickmarks").append("<p id='y2002' class='tickmarks' >2002</p>");
$("#tickmarks").append("<p id='y2006' class='tickmarks' >2006</p>");
$("#tickmarks").append("<p id='y2007' class='tickmarks' >2007</p>");
$("#tickmarks").append("<p id='y2012' class='tickmarks' >2012</p>");
$("#tickmarks").append("<p id='y2014' class='tickmarks' >2014</p>");


var tickLabel = $(".tickmarks")[0].getBoundingClientRect();
tickLabel = tickLabel.width;
var halfOfTickLabel = tickLabel/2;

    $('#y2002').css("margin-left", function(){ return 0 });
    $('#y2006').css("margin-left", function(){ return step  - halfOfTickLabel });
    $('#y2007').css("margin-left", function(){ return step * 2 - halfOfTickLabel  });
    $('#y2012').css("margin-left", function(){ return step * 3 - halfOfTickLabel });
    $('#y2014').css("margin-left", function(){ return width - tickLabel; });



alertValue = function() {
    var sliderValue = $("#mySlider").val();
    var filteredArray = fullNames.filter(function (obj) {
        return obj.value === sliderValue;
    });
    var year = filteredArray[0].key;
    drawChart(year);
};




d3.csv("data/dataset.csv", function(error, data) {
    if (error) throw error;

    var subset = data.filter(function(el){return  el.year === '2002'});

    subset.forEach(function(d) {
        d.dem = +d.dem;
        d.prorus = +d.prorus;
    });

    x.domain([0, 1]);
    y.domain([0, 1]);


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", 40)
        .style("text-anchor", "end")
        .text("національно-демократичні сили");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Комуністичні та проросійські");

    svg.selectAll(".dot")
        .data(subset)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.dem); })
        .attr("cy", function(d) { return y(d.prorus); })
        .style("fill", function(d) { return color(d.region); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
    ;

});

function resize() {

    // var dim = Math.min(parseInt(d3.select("#scatter").style("width")), parseInt(d3.select("#scatter").style("height"))),
        // width = dim * 1.5 - margin.left - margin.right,
        // height = dim - margin.top - margin.bottom;
    var box = $('#chart')[0].getBoundingClientRect();
    var width, height;

    if (box.height < box.width){
        width = box.height,
            height = box.height;
    }
    if (box.height > box.width){
        width = box.width,
            height = box.width;
    }

    // Update the range of the scale with new width/height
    x.range([0, width]);
    y.range([height, 0]);

    // Update the axis and text with the new scale
    svg.select('.x.axis')
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.select('.x.axis').select('.label')
        .attr("x",width);

    svg.select('.y.axis')
        .call(yAxis);

    // Update the tick marks
    xAxis.ticks(width / 75);
    yAxis.ticks(height / 75);


    svg.selectAll('.dot')
        .attr("cx", function(d) { return x(d.prorus); })
        .attr("cy", function(d) { return y(d.dem); });


    $("#mySlider").css("width", width);
    var step = width / 4;
    var tickLabel = $(".tickmarks")[0].getBoundingClientRect();
    tickLabel = tickLabel.width;
    var halfOfTickLabel = tickLabel/2;

    $('#y2002').css("margin-left", function(){ return 0 });
    $('#y2006').css("margin-left", function(){ return step  - halfOfTickLabel });
    $('#y2007').css("margin-left", function(){ return step * 2 - halfOfTickLabel  });
    $('#y2012').css("margin-left", function(){ return step * 3 - halfOfTickLabel });
    $('#y2014').css("margin-left", function(){ return width - tickLabel; });
}

d3.select(window).on('resize', resize);

// resize();

function drawChart(year, region) {

    var x = d3.scale.linear()
        .range([0, width]);

    d3.csv("data/dataset.csv", function(error, data) {
        if (error) throw error;

        var subset = data.filter(function(el){ return  el.year === year });

        if(region) {
            subset = subset
                .filter(function(el){
                    return  el.region === region });
        }

        subset.forEach(function(d) {
            d.dem = +d.dem;
            d.prorus = +d.prorus;
        });


        var mysvg = d3.select("#scatter").transition();
        var g = mysvg.select('g').transition();


        // var newData = chart_data.filter(function(t) {
        //     return t.year === year;
        // });

        x.domain([0, 1]);
        y.domain([0, 1]);



        // svg.selectAll(".dot").remove();

        d3.selectAll("circle")
            .data(subset)
            .transition()
            .duration(750)
            .attr("cx", function(d) { return x(d.dem); })
            .attr("cy", function(d) { return y(d.prorus); })


    });
    
}
