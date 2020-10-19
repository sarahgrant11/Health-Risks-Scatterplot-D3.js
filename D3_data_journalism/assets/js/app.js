var URL = 'https://raw.githubusercontent.com/sarahgrant11/d3-challenge/master/D3_data_journalism/assets/data/Statedata.csv'

var height = 620;
var width = 960;

var margin = {
  top: 20,
  right: 10,
  bottom: 120,
  left: 120
};

// 

var chartHeight = height - margin.top - margin.bottom;
var chartWidth = width - margin.left - margin.right;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.

var svg = d3.select("#scatter")
    .append("svg")
    .attr("height", height)
    .attr("width", width);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "smokes"


// function used for updating x-scale var upon click on axis label
function xScale(Statedata, chosenXAxis) {

    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(Statedata, d => d[chosenXAxis]) * 0.8,
            d3.max(Statedata, d => d[chosenXAxis]) * 1.2
    ])
        .range([0, width]);

    return xLinearScale;

}

function yScale(Statedata, chosenYAxis) {
    var yLinScale = d3.scaleLinear()
        .domain([d3.min(Statedata, d => d[chosenYAxis]) * 0.8,
            d3.max(Statedata, d => d[chosenYAxis]) * 1.2
        ])
        .range([chartHeight, 0]);

    return yLinScale
}

function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

    return xAxis;

function renderYAxis(newYScale, yAxis) {
  var leftAxis= d3.axisLeft(newYScale);
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

    return yAxis;
}
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d=> newYScale(d[chosenYAxis]))

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var ylabel;

    if (chosenYAxis === "smokes") {
        ylabel = "Smokes:";
    }
    else if (chosenYAxis ==='obesity') {
        ylabel = "Obesity (%):"
    }
    else {
        ylabel = "Healthcare (%):";
    }

    var xlabel;

    if (chosenXAxis === "income") {
        xlabel = "Income: $";
    }
    else if (chosenXAxis === "age") {
        xlabel ="Age:"
    }
    else {
        xlabel = "In Poverty (%):";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .style("background", "lightgray")
        .html(function(data) {
            return (`${data.state}<br>${data.abbr}<br>${xlabel} ${data[chosenXAxis]}<br>${ylabel} ${data[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
    // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv(URL).then(function(Statedata, err) {
    if (err) throw err; 

    console.log(Statedata)

  // parse data
    Statedata.forEach( data => {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obese = +data.obese;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
  })

    var xLinScale = xScale(Statedata, chosenXAxis);
    var yLinScale = yScale(Statedata, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinScale);
    var leftAxis = d3.axisLeft(yLinScale);

    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0,${chartHeight})`)
        .call(bottomAxis)

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis)

    var circlesGroup = chartGroup.selectAll("circle")
        .data(Statedata)
        .enter()
        .append("circle")
        .attr("cx", d => xLinScale(d[chosenXAxis]))
        .attr("cy", d => yLinScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", ".5");

  // Create group for three x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Average Age");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Average Household Income");

    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0-margin.left/3}),${height/2})`)

    var smokerLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 0-20)
        .attr("value", "smokes") // value to grab for event listener
        .classed("active", true)
        .text("Smoking (%)")
        .attr("transform", "rotate(-90)");

    var obesityLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 0-40)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obesity (%)")
        .attr("transform", "rotate(-90)");

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 0-60)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Without Healthcare(%)")
        .attr("transform", "rotate(-90)");  

    xlabelsGroup.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = value;
                console.log(chosenXAxis)
                // updates x scale for new data
                xLinScale = xScale(Statedata, chosenXAxis);
                // updates x axis with transition
                xAxis = renderXAxis(xLinScale, xAxis);
                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinScale, chosenXAxis, yLinScale, chosenYAxis);
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                // changes classes to change bold text
                if(chosenXAxis === 'poverty') {
                    povertyLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    ageLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    incomeLabel
                        .classed('active', false)
                        .classed('inactive', true);

                } else if (chosenXAxis === 'age') {
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    ageLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    incomeLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    
                } else {
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    ageLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    incomeLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    
                }
            }
        });
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                // replaces chosenXAxis with value
                chosenYAxis = value;
                console.log(chosenYAxis)
                // updates y scale for new data
                yLinScale = yScale(Statedata, chosenYAxis);
                // updates y axis with transition
                yAxis = renderYAxis(yLinScale, yAxis);
                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinScale, chosenXAxis, yLinScale, chosenYAxis);
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === 'smokes') {
                    smokerLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    obesityLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    healthcareLabel
                        .classed('active', false)
                        .classed('inactive', true);

                } else if (chosenYAxis === 'obesity') {
                    smokerLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    obesityLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    healthcareLabel
                        .classed('active', false)
                        .classed('inactive', true);

                } else {
                    smokerLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    obesityLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    healthcareLabel
                        .classed('active', true)
                        .classed('inactive', false);

                }
            }
        });
    updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)
    console.log(chosenXAxis)
    console.log(chosenYAxis)
});

function init() {
    simulate(document.getElementById("btn"), "click");
};