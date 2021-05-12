let btn = document.getElementById('demo-btn'); // DOM


/*
    Script for Visualization Demo
 */
let visualize = function () {
    let views = document.getElementsByClassName('views');
    views[0].style.display = "none";
    btn.style.display = "none";

    let parts = document.querySelectorAll('#visualization-demo>*'); // DOM
    let demo = document.getElementById('visualization-demo'); // DOM
    demo.style.display = "block";
    parts[0].style.display = "block";
    parts[1].style.display = "block";
    //console.log(demo);

    let content = document.querySelectorAll('.content');
    content[0].style.backgroundColor = "rgb(199, 208, 213)";

    const svg = d3.select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const logScale = d3.scaleLog().domain([1, 4001]);
    let color = function (d) {
        if (d === undefined) {
            return d3.interpolateReds(0);
        }
        else {
            return d3.interpolateReds(logScale(d + 1));
        }
    }

    var country_array = new Array();
    var year = 2000;

    const dataPromise = Promise.all([
        d3.json("./visualization-demo/world_map.json"),
        d3.csv("./visualization-demo/attack.csv"),
    ]);


    dataPromise.then(([map_data, attack_data]) => {
        const countries = topojson.feature(map_data, map_data.objects.countries);
        const projection = d3
            .geoMercator()
            .scale(135)
            .center([-11, 0])
            .rotate([0, 0])
            .translate([width / 2, height / 2 + 160]);
        const pathGenerator = d3.geoPath().projection(projection);
        const paths = svg.selectAll("path").data(countries.features);

        for (var i = 0; i < attack_data.length; i++) {
            var attack = attack_data[i];
            for (c in attack) {
                attack[c] = +attack[c];
            }

        };
        console.log(attack_data);

        async function draw_map1(year = 2000) {
            let worldmap = d3.select("svg.map");

            worldmap
                .append("path")
                .attr("class", "sphere")
                .attr("d", pathGenerator({ type: "Sphere" }));

            let attack = attack_data[Number(year) - 2000];

            var attack_num = function (country_name) {
                try {
                    return attack[country_name];
                }
                catch (err) {
                    return 0;
                }
            };

            // tooltip
            var div = d3
                .select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0.0);

            paths
                .enter()
                .append("path")
                .attr("class", "countries")
                .attr("d", (d) => pathGenerator(d))
                .attr("stroke", "black")
                .attr("fill", (d) => color(attack_num(d.properties.name)))
                .on("mouseover", function (path, d) {
                    var country_name = d.properties.name;
                    div.transition().duration(200).style("opacity", 0.95);
                    div
                        .html(
                            "attack: " +
                            attack_num(country_name)
                        )
                        .style("left", event.pageX + "px")
                        .style("top", event.pageY - 28 + "px");
                })
                .on("mouseout", function (d) {
                    div.transition().duration(500).style("opacity", 0);
                });

            // slider
            var slider = d3.select("#slider");
            slider.on("change", function () {
                var year = Number(this.value);
                d3.selectAll(".sphere").remove();
                d3.selectAll(".countries").remove();
                draw_map1(year);
                d3.select("output#slidertext").text(year);
            });

            // legend
            const lgHeight = 180;
            const barWidth = 2;

            var y = d3.scaleLog().domain([1, 4001]).range([lgHeight, 0]);

            var yLegend = d3
                .axisRight(y)
                .tickValues([3, 10, 100, 1000, 2000, 4000])
                .tickFormat(d3.format(",.1s"))
                .tickSize(3, 0);

            worldmap
                .append("g")
                .attr("class", "yLegend")
                .attr(
                    "transform",
                    "translate(" + (90 + 20) + "," + (515 + barWidth) + ")"
                )
                .call(yLegend);

            worldmap
                .append("text")
                .attr("class", "anotation")
                .attr("text-anchor", "start")
                .attr("transform", "translate(" + 88 + "," + 506 + ")")
                .text("Attack Amount");

            worldmap
                .append("g")
                .attr("width", lgHeight)
                .attr("class", "logScale")
                .attr("transform", "translate(" + 90 + "," + 515 + ")")
                .selectAll("bars")
                .data(d3.range(1, lgHeight, barWidth))
                .enter()
                .append("rect")
                .attr("y", (d, i) => lgHeight - i * barWidth)
                .attr("x", 0)
                .attr("width", 20)
                .attr("height", barWidth)
                .attr("fill", color);
        }
        draw_map1();
        console.log("map");
    });
}

btn.addEventListener('click', visualize);