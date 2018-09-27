var sliderYears = [
    {key: "2002", value: "0"},
    {key: "2006", value:"10"},
    {key: "2007", value:"20"},
    {key: "2012", value:"30"},
    {key: "2014", value:"40"}
];

var margin;
if(window.innerWidth < 825){
    margin = {top: 10, right: 10, bottom: 20, left: 20};
}
else {
    margin = {top: 10, right: 10, bottom: 50, left: 50};
}
var box = $('#chart')[0].getBoundingClientRect();
var dim = Math.min(parseInt(d3.select("#chart").style("width")), parseInt(d3.select("#chart").style("height")));
var height = box.height - margin.top - margin.bottom;
var width = box.width - margin.left - margin.right;

$("#slider").css("width", width).css("margin-left", margin.left);

//задаємо відступи для лейбів з роками на слайдер
$("#mySlider").css("width", width);
var step = width / 4;
$("#tickmarks").append("<p id='y2002' class='tickmarks' >2002</p>");
$("#tickmarks").append("<p id='y2006' class='tickmarks' >2006</p>");
$("#tickmarks").append("<p id='y2007' class='tickmarks' >2007</p>");
$("#tickmarks").append("<p id='y2012' class='tickmarks' >2012</p>");
$("#tickmarks").append("<p id='y2014' class='tickmarks' >2014</p>");

//визначаємо ширину самого напису, аби напис був посередині
var tickLabel = $(".tickmarks")[0].getBoundingClientRect();
tickLabel = tickLabel.width;
var halfOfTickLabel = tickLabel/2;
//задаємо лейби для слайдера
$('#y2002').css("margin-left", function(){ return 0 });
$('#y2006').css("margin-left", function(){ return step  - halfOfTickLabel });
$('#y2007').css("margin-left", function(){ return step * 2 - halfOfTickLabel  });
$('#y2012').css("margin-left", function(){ return step * 3 - halfOfTickLabel });
$('#y2014').css("margin-left", function(){ return width - tickLabel; });


//перемальовуємо графік у відповідь на рух слайдера
alertValue = function() {
    var sliderValue = $("#mySlider").val();
    var filteredArray = sliderYears.filter(function (obj) {
        return obj.value === sliderValue;
    });
    var year = filteredArray[0].key;
    $('#bigYearLabel').html(year);
    var selectedRegion = document.querySelector('input[name="check"]:checked').value;
    drawChartYear(year, selectedRegion);
};

//малюємо дот-плот
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

retrieve_my_data(function(data){

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

    var dots =  svg.selectAll(".dot")
        .data(subset)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.dem); })
        .attr("cy", function(d) { return y(d.prorus); })
        .style("fill", function(d) { return color(d.region); })
        .style("opacity", "0.7")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on("click", function (d) {
            d3.selectAll(".line").remove();
            var thisPoint = data.filter(function(k){
                return k.rayon === d.rayon;
            });
            var line = d3.svg.line()
                .x(function(d) { return x(d.dem); })
                .y(function(d) { return y(d.prorus); });
            svg.append("path")
                .attr("class", "line")
                .attr("d", line(thisPoint));

        });

        svg.append("text")
            .attr("x", x(0.4))
            .attr("y", y(0.45))
            .attr("dy", 0)
            .attr("id", "hint1")         
            .html("клікайте на точки, аби подивитись, як голосував район протягом 2002-2014 рр.")
            .call(wrap, 250);

        svg.append("text")
            .attr("x", x(0.7))
            .attr("y", y(0.8))
            .attr("dy", 0)
            .attr("id", "bigYearLabel")
            .html(function(){
                var sliderValue = $("#mySlider").val();
                var filteredArray = sliderYears.filter(function (obj) {
                    return obj.value === sliderValue;
                });
                var year = filteredArray[0].key;
                return year
            });
            

    //функція пошуку по точках
    $("#filter").keyup(function () {
        var value = $(this).val();
        if (value) {
            var i = 0; var re = new RegExp(value, "i");
            subset.forEach(function (d) {
                if (!d.rayon.match(re)) {
                    d3.select(dots[0][i]).style("visibility", "hidden");
                } else {
                    d3.select(dots[0][i]).style("visibility", "visible");
                }
                i++;
            });
        } else {
            dots.style("visibility", "visible");
        }
    }).keyup();
});

//перемальовуємо дотт-плот на зміну року чи регіону
function drawChartYear(year, region) {
    document.getElementById('filter').value = '';
    $("#hint1").remove();

    x.range([0, width]);
    y.range([height, 0]);

    svg.select('.x.axis')
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.select('.y.axis')
        .call(yAxis);

    retrieve_my_data(function(data){

        var subset;
        if(region) {
            subset = data.filter(function (el) {
                return el.year === year && el.region === region
            });
        }
        else {
            subset = data.filter(function (el) {
                return el.year === year
            });
        }


        subset.forEach(function(d) {
            d.dem = +d.dem;
            d.prorus = +d.prorus;
        });


        x.domain([0, 1]);
        y.domain([0, 1]);

        var t = d3.transition()
            .duration(1500);

        var dots = svg.selectAll(".dot")
            .data(subset);

        //видаляємо непотрібні точки (коли обираємо регіон)
        dots.exit()
            .attr("class", "exit")
            .transition(t)
            .attr("y", 60)
            .style("fill-opacity", 1e-6)
            .remove();

        //змінюємо наявні
        dots.attr("class", "dot")
            .transition(t)
            .attr("cx", function (d) {
                return x(d.dem);
            })
            .attr("cy", function (d) {
                return y(d.prorus);
            })
            .style("fill", function (d) {
                return color(d.region);
            })
            .style("opacity", "0.7");

        //додаємо відсутні точки (коли після регіону обираємо усі і треба повернути видалені)
        dots.enter().append("circle")
            .attr("class", "dot")
            .attr("cx", function (d) {
                return x(d.dem);
            })
            .attr("cy", function (d) {
                return y(d.prorus);
            })
            .attr("r", 4)
            .style("fill", function (d) {
                return color(d.region);
            })
            .style("opacity", "0.7")
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .on("click", function (d) {
                d3.selectAll(".line").remove();
                var thisPoint = data.filter(function(k){
                    return k.rayon === d.rayon;
                });
                var line = d3.svg.line()
                    .x(function(d) { return x(d.dem); })
                    .y(function(d) { return y(d.prorus); });
                svg.append("path")
                    .attr("class", "line")
                    .attr("d", line(thisPoint));

            })
            .transition(t);



        $("#filter").keyup(function () {
            var value = $(this).val();
            if (value) {
                var i = 0; var re = new RegExp(value, "i");
                subset.forEach(function (d) {
                    if (!d.rayon.match(re)) {
                        d3.select(dots[0][i]).style("visibility", "hidden");
                    } else {
                        d3.select(dots[0][i]).style("visibility", "visible");
                    }
                    i++;
                });
            } else {
                dots.style("visibility", "visible");
            }
        }).keyup();

    });

    // $("g.y.axis > g.tick > text").attr("x", "-5");

}


function resize() {
    var box = $('#chart')[0].getBoundingClientRect();
    var height = box.height - margin.top - margin.bottom;
    var width = box.width - margin.left - margin.right;

    x.range([0, width]);
    y.range([height, 0]);

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

    svg.select('.x.axis')
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.select('.x.axis').select('.label')
        .attr("x", width);

    svg.select(".hint")
        .attr("x", x(0.4))
        .attr("y", y(0.43));


    svg.select('.y.axis')
        .call(yAxis);

    svg.selectAll('.dot')
        .attr("cx", function(d) { return x(d.prorus); })
        .attr("cy", function(d) { return y(d.dem); });

    if(window.innerWidth < 825) {
        svg.selectAll("#hint1")
            .attr("x", x(0.4))
            .attr("y", y(0.45))
            .attr("dy", 0)
            .call(wrap, 150);
    }

    svg.selectAll("#bigYearLabel")
        .attr("x", x(0.7))
        .attr("y", y(0.8))
        .attr("dy", 0);



    //resize slider
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
} //end of resize function

d3.select(window).on('resize', resize);
d3.select(window).on('orientationchange', resize);


//перемальовуємо графік після вибору регіону
d3.selectAll("input[name='check']").on("change", function(){
    d3.selectAll(".line").remove();
    var sliderValue = $("#mySlider").val();
    var filteredArray = sliderYears.filter(function (obj) {
        return obj.value === sliderValue;
    });
    var year = filteredArray[0].key;

    var selectedRegion = document.querySelector('input[name="check"]:checked').value;
    drawChartYear(year, selectedRegion);

});

$("#animation").on("click", function() {
    var selectedRegion = document.querySelector('input[name="check"]:checked').value;
    document.querySelector('input#mySlider').value = 0;
    $('#bigYearLabel').html("2002");
    drawChartYear("2002", selectedRegion);

    setTimeout(function(){
        document.querySelector('input#mySlider').value = 10;
        $('#bigYearLabel').html("2006");
        drawChartYear("2006", selectedRegion);

    }, 1000);
    
    setTimeout(function(){
        document.querySelector('input#mySlider').value = 20;
        $('#bigYearLabel').html("2007");
        drawChartYear("2007", selectedRegion);
    }, 2000);
    
    setTimeout(function(){
        document.querySelector('input#mySlider').value = 30;
        $('#bigYearLabel').html("2012");
        drawChartYear("2012", selectedRegion);
    }, 3000);
    
    setTimeout(function(){
        document.querySelector('input#mySlider').value = 40;
        $('#bigYearLabel').html("2014");
        drawChartYear("2014", selectedRegion);
    }, 4000);
});



function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.2, // ems
            y = text.attr("y"),
            x = text.attr("x"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", x).attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
            }
        }
    });
}

