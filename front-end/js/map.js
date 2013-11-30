var map;
var overlayContext;
var overlayLayer;
var mapMonitor;

function createMap(elementId){
	
	var netLayout = d3.select(elementId);

	netLayout.html("");
	
	var mapElement = netLayout.append("div")
	  .attr("id","map")
	
	map = new google.maps.Map(mapElement.node(), {
	  zoom: 2,
	   mapTypeControl: true,
	   panControl: false,
	   zoomControl: true,
		scaleControl: true,
		streetViewControl: false,

	   mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT
		},
	  center: new google.maps.LatLng(0,0),
	  mapTypeId: google.maps.MapTypeId.TERRAIN
	});
	
	// Load the station data. When the data comes back, create an overlay.
    var overlay = new google.maps.OverlayView();

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {

		
		// set this as locally scoped var so event does not get confused
		overlayContext = this;

		overlayLayer = d3.select(this.getPanes().overlayMouseTarget)
			.append("div")
			.attr("height", "100%")
			.attr("width", "100%")
			.attr("id", "map-overlay");
		
		svg = overlayLayer.append("svg");
		
		appendMarkers(svg);
		
		vis = svg.append('svg:g');
 
		edgeRoot = vis.append('svg:g');
		nodeRoot = vis.append('svg:g');
		edges = edgeRoot.selectAll('path');
		nodes = nodeRoot.selectAll('g');
 
		google.maps.event.addDomListener(overlayLayer, 'click', function() {
			google.maps.event.trigger(overlayContext, 'click');
		});
		
		overlay.draw = updateMap;
		
		console.log("adding overlay");
		
		
	};

  // Bind our overlay to the map…
  overlay.setMap(map);
  
}


function updateMap(){
	var radius = 10;
	padding = 15;
		
	// update existing markers
	nodes = nodes.data(graph.node.list, function(d) { return d.id; })
	  .style("opacity", calculateElementOpacity)
	  .classed("old-data", markAsOld)
	  .classed("filtered", invertFilter(elementFilter))
	
	node = nodes.enter().append("svg:g")
	 .attr('class', function(d){return d.network} )
	 .attr("id", function(d) { return "node-" + d.id; })
	 .on("mouseover", graphElementHover)
	 .on("mouseout", graphElementHoverOff)
	 .on("click", graphElementSelected)	
	 .classed("filtered", invertFilter(elementFilter))
	 .classed("no-gps", function(data){return !data.gpsSet;})
	 .classed("end-point", decorateNode)
	 .classed('node', true)
	  
	node.append("svg:circle")
	 .attr("r", radius)
	 .attr("cx", padding)
	 .attr("cy", padding)

	// Add a label.
	node.append("svg:text")
	 .attr("x", padding + 7)
	 .attr("y", padding)
	 .attr("dy", ".37em")
	 .text(function(d) { return d.id; });

	edges = designEdges(edges);
	
	updateMapPositions();
	
	
}

function updateMapPositions(){
	console.log("setting possitions");
	var projection = overlayContext.getProjection(),
		padding = 15;
		
	nodes.attr('transform', function(data) {
		d = new google.maps.LatLng(data.lat, data.lng);
		d = projection.fromLatLngToDivPixel(d);
		
		data.mapX = d.x  ;
		data.mapY = d.y ;
		
		return 'translate(' + (data.mapX-padding) + ',' + (data.mapY-padding) + ')';
	});
	
	edges.attr("d", function(d) {
		return createPath(d.source.mapX, d.source.mapY, 0,0, d.target.mapX, d.target.mapY, 0,0);
	});
	
}