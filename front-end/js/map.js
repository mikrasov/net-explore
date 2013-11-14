var map;

function createMap(elementId){
	var netLayout = d3.select(elementId);
	console.log(netLayout);
	netLayout.html("");
	var mapElement = netLayout.append("div")
	.attr("id","map")
	
	map = new google.maps.Map(mapElement.node(), {
	  zoom: 1,
	  center: new google.maps.LatLng(0,0),
	  mapTypeId: google.maps.MapTypeId.TERRAIN
	});
	
	console.log(map);
}

function updateMap(json){
	// Load the station data. When the data comes back, create an overlay.
    var overlay = new google.maps.OverlayView();

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {

	// set this as locally scoped var so event does not get confused
		var me = this;
		
    var layer = d3.select(this.getPanes().overlayMouseTarget)
        .append("div")
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("class", "stations");
		
	// Add a listener - we'll accept clicks anywhere on this div, but you may want
		// to validate the click i.e. verify it occurred in some portion of your overlay.
		google.maps.event.addDomListener(layer, 'click', function() {
			google.maps.event.trigger(me, 'click');
		});
		
    overlay.draw = function() {
    var radius = 10;
    var projection = this.getProjection(),
        padding = 15;

    var marker = layer.selectAll("svg")
      .data(json.node.list)
	  
	  
      .each(transform) // update existing markers
    
	marker.enter().append("svg:svg")
	   .attr("class", "node")
		.attr("id", function(d) { return "node-" + d.id; })
		.on("mouseover", graphElementHover)
		.on("mouseout", graphElementHoverOff)
		.on("click", graphElementSelected)	
		.classed("filtered", invertFilter(elementFilter))
      .each(transform)
     
	  .on("click", function(d){console.log(d)});
	  
    marker.append("svg:circle")
      .attr("r", radius)
      .attr("cx", padding)
      .attr("cy", padding)
	  

    // Add a label.
    marker.append("svg:text")
            .attr("x", padding + 7)
            .attr("y", padding)
            .attr("dy", ".37em")
            .text(function(d) { return d.id; });


    var markerLink = layer.selectAll(".edge")
      .data(json.edge.list)
	  .style("opacity", calculateElementOpacity)
	  .classed("old-data", markAsOld)
      .each(pathTransform) // update existing markers       
	  
    markerLink.enter().append("svg:svg")
     .attr("class", "edge")
	 .attr("id", function(d) { return "edge-" + d.id; })
	 .on("mouseover", graphElementHover)
	 .on("mouseout", graphElementHoverOff)
	 .on("click", graphElementSelected)
     .each(pathTransform);
	  
    function pathTransform(d) {
        var t, b, l, r, w, h, tX, tY, currentSvg;
        $(this).empty(); // get rid of the old lines (cannot use d3 .remove() because i cannot use selectors after ... )

        var dsrc = new google.maps.LatLng(d.source.lat, d.source.lng);
        var dtrg = new google.maps.LatLng(d.target.lat, d.target.lng);
        
		var d1 = projection.fromLatLngToDivPixel(dsrc);
        var d2 = projection.fromLatLngToDivPixel(dtrg);
        if ( d1.y < d2.y ) {
            t = d1.y;
            b = d2.y;
        } else {
            t = d2.y;
            b = d1.y;
        }
        if ( d1.x < d2.x ) {
            l = d1.x;
            r = d2.x;
        } else {
            l = d2.x;
            r = d1.x; 
        }
		
		tX = r-1;
		tY = b-t;
		w = tX==0?(tX+1):tX;
		h = tY==0?(tY+1):tY;
		
       console.log(d.source.id+" ->"+d.target.id+" "+tX +" "+tY)

        // drawing the diagonal lines inside the svg elements. We could use 2 cases instead of for but maybe you will need to orient your graph (so you can use some arrows)

		if (( d1.y <= d2.y) && ( d1.x <= d2.x)) {
	
		} else if ((d1.x >= d2.x) && (d1.y >= d2.y)){

		} else if (( d1.y <= d2.y) && ( d1.x >= d2.x)){

		} else if ((d1.x < d2.x) && (d1.y > d2.y)){

		} else {
			console.log("something is wrong!!!");
		}
		
		currentSvg = d3.select(this)
            .style("left", (l) + "px")
            .style("top", (t) + "px")
            .style("width", (w) + "px")
            .style("height", (h) + "px");
		
		currentSvg.append("svg:line")
			.style("stroke-width", 2)
			.style("stroke", "black")
			.attr("y1", 0)
			.attr("x1", 0)
			.attr("x2", tX)
			.attr("y2", tY);
				

        return currentSvg;
    } 
    
    function transform(d,i) {
        //node_coord[i + "," + 0] = d.lng;
        //node_coord[i + "," + 1] = d.lat;
		d.mapX = d.lng;
		d.mapY = d.lat;
		
        d = new google.maps.LatLng(d.lat, d.lng);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
    }
    
    layer.append("div")
        .attr("class", "stations.line");

	};
};
  
  // Bind our overlay to the map…
  overlay.setMap(map);

}

