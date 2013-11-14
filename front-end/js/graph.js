// set up SVG for D3
var width  = 1024;
var height = 768;

  
var ipLabelTable = [
	{ re: /(^127\.0\.0\.1)/, network: "localhost"},
	{ re: /(^10\.)/, network: "private"},
	{ re: /(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)/, network: "private"},
	{ re: /(^192\.168\.)/, 	network: "private"}
];
  
var graph = {
	flow: {
		dict: [],
		list: [],
		count: 0
	},
	device: {
		dict: [],
		list: [],
		count: 0
	},
	node: {
		dict: [],
		list: [],
		count: 0
	},
	edge: {
		dict: [],
		list: [],
		count: 0
	},
};

// handles to link and node element groups
var svg, vis, edgeRoot, nodeRoot, edges, nodes;
var force;

function createGraph(elementId){

 var netLayout = d3.select(elementId).html("");

 svg = netLayout.append('svg').call(d3.behavior.zoom().on("zoom", rescale))
 
 svg.append("defs").append("marker")
    .attr("id", "end-arrow")
    .attr("refX", 6) 
	.attr("viewBox", "0 -5 10 10")
    .attr("markerWidth", 3)
    .attr("markerHeight", 3)
	.attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5 Z"); //this is actual shape for arrowhead
 
 svg.append("defs").append("marker")
    .attr("id", "start-arrow")
    .attr("refX", 4) 
	.attr("viewBox", "0 -5 10 10")
    .attr("markerWidth", 3)
    .attr("markerHeight", 3)
	.attr("orient", "auto")
    .append("path")
    .attr("d", "M10,-5L10,0L10,5 Z"); //this is actual shape for arrowhead
	
 svg.append("defs").append("marker")
    .attr("id", "end-arrow-selected")
	.attr("class", "selected")
    .attr("refX", 6) 
	.attr("viewBox", "0 -5 10 10")
    .attr("markerWidth", 3)
    .attr("markerHeight", 3)
	.attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5 Z"); //this is actual shape for arrowhead
 
 svg.append("defs").append("marker")
    .attr("id", "start-arrow-selected")
    .attr("refX", 4) 
	.attr("viewBox", "0 -5 10 10")
    .attr("markerWidth", 3)
    .attr("markerHeight", 3)
	.attr("orient", "auto")
    .append("path")
    .attr("d", "M10,-5L10,0L10,5 Z"); //this is actual shape for arrowhead
 
 vis = svg.append('svg:g');

 edgeRoot = vis.append('svg:g');
 nodeRoot = vis.append('svg:g');
 edges = edgeRoot.selectAll('path');
 nodes = nodeRoot.selectAll('g');

  force = force = d3.layout.force()
	.nodes(graph.node.list)
	.links(graph.edge.list)
	.size([width, height])
	.linkDistance(linkDistance)
	.linkStrength(linkStrength)
	.gravity(.01)
	.charge(-300)
	.on('tick', tick)
}

// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers

  edges.attr("d", function(d) {
	var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
		normX = deltaX / dist,
        normY = deltaY / dist,
		spacingX = (Math.abs(deltaX) < Math.abs(deltaY))?((deltaY > 0)? 10 : -10):0,
		spacingY = (Math.abs(deltaX) > Math.abs(deltaY))?((deltaX > 0)? -10 : 10):0,
		sourceXPadding = 55,
		sourceYPadding = 30,
		targetXPadding = 60,
        targetYPadding = 35,
		sourceX = d.source.x + (sourceXPadding * normX)+spacingX,
        sourceY = d.source.y + (sourceYPadding * normY)+spacingY,
        targetX = d.target.x - (targetXPadding * normX)+spacingX,
        targetY = d.target.y - (targetYPadding * normY)+spacingY;
		dx = d.target.x - d.source.x,
		dy = d.target.y - d.source.y,
		dr = Math.sqrt(dx * dx + dy * dy) *3;
	return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
  });
  nodes.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}

// update graph (called when needed)
function updateGraph() {
  
  // set the graph in motion
  force.start();
	
  updateSidebar();
  
  // path (link) group
  edges = edges.data(graph.edge.list, function(d) { return d.id; });

  // update existing links
  edges.style('marker-end', function(d) { return 'url(#end-arrow)'; })
  .style("opacity", calculateElementOpacity)
  .classed("old-data", markAsOld)
  .classed("filtered", invertFilter(elementFilter));
  
  console.log("init");
  console.log(edges);
   
  // add new links
  edges.enter().append('svg:path')
    .attr('class', 'edge')
	.attr("id", function(d) { return "edge-" + d.id; })
	.style('marker-end', function(d) { return 'url(#end-arrow)'; })
    .on("mouseover", graphElementHover)
	.on("mouseout", graphElementHoverOff)
	.on("click", graphElementSelected)
	.classed("filtered", invertFilter(elementFilter));


  // remove old links
  edges.exit().remove();
  
  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  nodes = nodes.data(graph.node.list, function(d) { return d.id; });

  // update existing nodes
  nodes.style("opacity", calculateElementOpacity)
		.classed("old-data", markAsOld)
		.classed("filtered", invertFilter(elementFilter));
  
  // add new nodes
  var nodeContent = nodes.enter()
					.append('svg:g')
					.attr('class', 'node')
					.attr("id", function(d) { return "node-" + d.id; })
					.on("mouseover", graphElementHover)
					.on("mouseout", graphElementHoverOff)
					.on("click", graphElementSelected)	
					.classed("filtered", invertFilter(elementFilter));
		
  nodeContent.append('svg:rect')
    .attr('rx', 5)
	.attr('ry', 5)
	.attr('width', 100)
	.attr('height', 50)
	.attr('x', -50)
	.attr('y', -25)
	.attr('class', function(d){return d.network} );
    
  // show node Labels
  nodeContent.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'node-label')
      .text(function(d) { return d.data.ip; });

  // remove old nodes
  nodes.exit().remove();
}

function rescale() {
  trans = d3.event.translate;
  scale = d3.event.scale;

  vis.attr("transform", "translate(" + trans + ")" + " scale(" + scale + ")");
}

function forwardAlpha(layout, alpha, max) {
  alpha = alpha || 0;
  max = max || 1000;
  var i = 0;
  while(layout.alpha() > alpha && i++ < max) layout.tick();
}
	

  
function invertFilter(filter){
	return function(data){
		return !filter(data);
	};
}