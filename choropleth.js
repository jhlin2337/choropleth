// Set up dimensions
let svg = d3.select("svg");
let width = +svg.attr("width");
let height = +svg.attr("height");

// Specify geopath for creating map of USA
let path = d3.geoPath();

// Specify a color scale
let color = d3.scaleThreshold()
	.domain([3, 12, 21, 30, 39, 48, 57, 66])
	.range(d3.schemeBlues[9])

/*************************************************************************/
// Create the legend bar
var x = d3.scaleLinear()
    .domain([3, 75])
    .rangeRound([600, 860]);

var g = svg.append("g")
    .attr("transform", "translate(0,40)");

g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", d => x(d[0]))
    .attr("width", d => x(d[1]) - x(d[0]))
    .attr("fill", d => color(d[0]));

g.call(d3.axisBottom(x)
    .tickSize(16)
    .tickFormat(x => x+'%')
    .tickValues(color.domain()))
  .select(".domain")
    .remove();

/*************************************************************************/

// Request map and education data and use to make choropleth graph
d3.queue()
  .defer(d3.json, 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json')
  .defer(d3.json, 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json')
  .await(function(error, mapData, educationData) {
  	if (error) throw error;

  	// Create a map mapping county id with county data to use
  	let educationalAttainment = d3.map()
  	for (let i = 0; i < educationData.length; i++) {
  		educationalAttainment.set(educationData[i].fips, educationData[i]);
  	}

  	let tooltip = d3.select('body')
  					.append('div')
  					.attr('class', 'tooltip');

  	// Create the outlines of the counties of the USA
  	svg.selectAll('.county')
  	  .data(topojson.feature(mapData, mapData.objects.counties).features)
  	  .enter().append('path')
  	    .attr('d', path)
  	    .attr('fill', d => color(educationalAttainment.get(d.id).bachelorsOrHigher))
  	    .on("mouseover", function(d) {
  	    	const county = educationalAttainment.get(d.id).area_name;
  	    	const state = educationalAttainment.get(d.id).state;
  	    	const bachelors = educationalAttainment.get(d.id).bachelorsOrHigher;
	   	  	let content = county + ', ' + state + ': ' + bachelors + '%';

          	tooltip.style("visibility", "visible")
                   .html(content)
       })
       .on("mousemove", () => tooltip.style("left",(event.pageX+20)+"px").style('top', (event.pageY-36)+'px'))
       .on("mouseout", () => tooltip.style("visibility", "hidden"));
  })




