// set up SVG for D3
var width  = 1024;
var height = 768;

  
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

console.log("create graph");
 var netLayout = d3.select(elementId).html("");

 netLayout = netLayout.append('div')
			 .attr("id", "graph");
			 
 svg = netLayout.append('svg').call(d3.behavior.zoom().on("zoom", rescale))
 
 appendMarkers(svg);
 
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
	.friction(.35)
	.gravity(.04)
	.charge(-800)
	.on('tick', tick)
}

// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers

  edges.attr("d", function(d) {
	return createPath(d.source.x, d.source.y, 55,30, d.target.x, d.target.y, 60,35);
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
  
  edges = designEdges(edges);
  
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
					.attr('class', function(d){return d.network} )
					.attr("id", function(d) { return "node-" + d.id; })
					.on("mouseover", graphElementHover)
					.on("mouseout", graphElementHoverOff)
					.on("click", graphElementSelected)	
					.classed('node', true)
					.classed("filtered", invertFilter(elementFilter))
					.classed("end-point", decorateNode)
		
  nodeContent.append('svg:rect')
    .attr('rx', 5)
	.attr('ry', 5)
	.attr('width', 100)
	.attr('height', 50)
	.attr('x', -50)
	.attr('y', -25)
/*	
  nodeContent.append('svg:rect')
	.attr('width', 80)
	.attr('height', 10)
	.attr('x', -40)
	.attr('y', 15)

  nodeContent.append('svg:rect')
	.attr('width', 80)
	.attr('height', 10)
	.attr('x', -40)
	.attr('y', 5)
  */  
  // show node Labels
  nodeContent.append('svg:text')
      .attr('x', 0)
      .attr('y', -5)
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