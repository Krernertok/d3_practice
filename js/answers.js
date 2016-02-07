(function() {

    var width = 650,
        height = 410;

    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    };

    var yAxisOffset = -5;

    var formatter = d3.time.format("%Y-%m-%d %H:%M:%S");

    var transitionDuration = 1000;

    d3.select("#answers")
      .attr({
          "width": width + margin.left + margin.right,
          "height": height + margin.top + margin.bottom
      })
      .style("border", "1px solid grey")
      .append("g")
      .classed("container", true)
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");


    d3.json("data/answers.json", function(error, data) { handleAnswers(error, data.answers); })


    function handleAnswers(error, data) {

        var timeParserFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
        var labelFormat = d3.time.format("%e %b %y");

        var timestampArray = data.map(function(element) {
            return timeParserFormat.parse(element.date)
        });
             
        var labelArray = timestampArray.map(function(element) {
            return labelFormat(element);
        })

        console.log(labelArray);

        var x = d3.scale.ordinal()
                  .domain(d3.range(1, data.length + 1))
                  .rangeRoundBands([0, width], 0.1);

        var xAxis = d3.svg.axis()
                      .scale(x)
                      .orient("bottom")
                      .tickFormat(function(el) {
                          return labelArray[el - 1];
                      });


        var y = d3.scale.linear()
                  .range([height, 0]);

        var yAxis = d3.svg.axis()
                      .scale(y)
                      .orient("left")
                      .tickSize([width])
                      .tickFormat(d3.format("%"));

        d3.select("g.container")
          .append("g")
          .classed("x axis", true)
          .attr("transform", "translate(0, " + height + ")")
          .call(xAxis);

        d3.select("g.container")
          .append("g")
          .classed("y axis", true)
          .attr("transform", "translate(" + width + ")")
          .call(yAxis);

        d3.select(".y.axis").selectAll("text")
          .attr("transform", "translate(" + yAxisOffset + ")");


        d3.select("g.container")
          .selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr({
              "x": function(d) { return x(d.order); },
              "y": height,
              "width": x.rangeBand(),
              "height": 0
          })
          .transition()
          .duration(transitionDuration)
          .attr({
              "y": function(d) { return y(d.correct); },
              "height": function(d) { return height - y(d.correct); }
          });


        // d3.selectAll("rect")
        //   .on("mouseover", function(d) {
        //       d3.select("#correct-answers")
        //         .classed("hidden", false)
        //         .select("span")
        //         .text(d.answers + " correct answers");

        //       d3.select(this)
        //         .style({
        //             "fill": "orange",
        //             "cursor": "none"
        //         })
        //   })
        //   .on("mouseout", function() {
        //       d3.select(this)
        //         .style("fill", "orangered");

        //       d3.select("#correct-answers")
        //         .classed("hidden", true);
        //   })
        //   .on("mousemove", function() { 
        //       var coordinates = d3.mouse(this);

        //       d3.select("#correct-answers")
        //         .style({
        //             "left": coordinates[0] + "px",
        //             "top": coordinates[1] + "px"
        //         });
        //   });

        d3.selectAll("rect")
          .on("mouseover", function(d) {
              d3.select("#correct-answers")
                .classed("hidden", false)
                .style({
                    "top":  y(d.correct) - 15 + "px",
                    "left": (x(d.order) + margin.left + (x.rangeBand() / 2) - 65) + "px"
                })
                .select("span")
                .text(d.answers + " correct answers");

              d3.select("#triangle")
                .classed("hidden", false)
                .style({
                    "top":  y(d.correct) + margin.top - 5 + "px",
                    "left": (x(d.order) + margin.left + (x.rangeBand() / 2) - 5) + "px"
                });

              d3.select(this)
                .style("fill", d3.hcl("orangered").darker());
          })
          .on("mouseout", function() {
              d3.select(this)
                .style("fill", "orangered");

              d3.select("#correct-answers")
                .classed("hidden", true);

              d3.select("#triangle")
                .classed("hidden", true);
          });
    }

}());

(function() {

    var side = 720;

    d3.select("#pack")
        .style({
            "width": side + "px",
            "height": side + "px",
            "border": "1px solid gray"
        });


    d3.json("data/tagnames.json", handleTagnames);

    function handleTagnames(error, data) {
        if (error) {
            return console.log(error);
        }

        var tagnames = data.tagnames;
        var dataArray = [];
        var totalTagnames = tagnames.length;
        var numberOfTries = 10;

        for (var key in tagnames) {
            if (tagnames.hasOwnProperty(key)) {
                var wrong = Math.floor(Math.random() * numberOfTries);
                var newObject = {};
                
                newObject.name = key;
                newObject.value = d3.max([0.5, wrong]);
                newObject.percentCorrect = 1 - (parseFloat(wrong) / numberOfTries);

                dataArray.push(newObject);
            }
        }

        dataArray.sort(function(a, b) {
            if (a.value > b.value) {
                return -1;
            } else if (a.value < b.value) {
                return 1;
            } else {
                return 0;
            }
        });

        var packableData = {children: dataArray};

        var packChart = d3.layout.pack()
            .sort(null)
            .size([side, side]);

        console.log(packableData);

        var colorScale = d3.scale.linear()
            .domain([0, 0.5, 1])
            .range(["crimson", "orange", "#41A01E"])
            .interpolate(d3.interpolateHsl);

        var nodes = d3.select("#pack").selectAll(".node")
            .data(packChart.nodes(packableData)
                .filter(function(d) { return !d.children; }))
            .enter()
            .append("g")
            .attr({
                "class": "node",
                "transform": function(d) { 
                    return "translate(" + d.x + "," + d.y + ")"; 
                }
            });

        nodes.append("circle")
            .attr({
                "r": function(d) { return d.r; }
            })
            .style({
                "fill": function(d) { return colorScale(d.percentCorrect); }
            });

        nodes.append("text")
            .text(function(d) { return d.name.substring(0, d.r / 3); })
            .attr("dy", ".3em")
            .style({
                "fill": "black",
                "font-family": "sans-serif",
                "font-size": "10px"
            });


        var transitionDuration = 100;

        d3.selectAll(".node")
            .on("mouseover", function() {
                
                var node = this;
                var currentCircle = d3.select(this).select("circle");

                d3.select("#pack")
                    .append(function() {
                        var removed = d3.select(node).remove();
                        return removed[0][0];
                    });


                currentCircle.attr("oldRadius", currentCircle.datum().r);
                currentCircle.attr("oldFill", currentCircle.style("fill"));
                
                currentCircle.transition()
                    .duration(transitionDuration)
                    .attr("r", 45)
                    .style("fill", d3.rgb(currentCircle.style("fill")).brighter(0.3))
                    .style("filter", "url(#drop-shadow)");

            })
            .on("mouseout", function() {
               var currentCircle = d3.select(this).select("circle");

                currentCircle.transition()
                    .duration(transitionDuration)
                    .attr("r", currentCircle.attr("oldRadius"))
                    .style("fill", currentCircle.attr("oldFill"))
                    .style("filter", "none");
            });
    }

}());