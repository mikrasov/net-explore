

var map;

var test_data =  {"directed": true, "graph": [], "node": { "list": [
{"lat": 44.391643516091975, "lng": 23.159677682342053, "id": "1:a"}, 
{"lat": 44.315988, "lng": 23.818359, "id": "a:a::"}, 
{"lat": 44.29844994776969, "lng": 24.402314492323608, "id": "b:b"}, 
{"lat": 44.351118152120485, "lng": 23.341791630955303, "id": "a:c"}, 
{"lat": 44.889424527442685, "lng": 23.960970697645276, "id": "e:d"}, 
{"lat": 43.46084400349923, "lng": 23.975774627524885, "id": "d:6104:1"}, 
{"lat": 44.64680010013528, "lng": 23.20292820976948, "id": "c:6104:2"}, 
{"lat": 44.40446080879215, "lng": 23.953536570796015, "id": "b:6104:3"}, 
{"lat": 44.18593375168617, "lng": 23.769879901486856, "id": "af:6104:4"}, 
{"lat": 44.09051846584001, "lng": 24.14130778735744, "id": "aaaa3bab:3d:7305"}, 
{"lat": 44.66376251969314, "lng": 23.77379490100736, "id": "aaaa3bab:3d:5507"}, 
{"lat": 44.6240449587762, "lng": 24.08347249542858, "id": "aaaa3bab:3d:6f06"}, 
{"lat": 45.00138334367271, "lng": 24.092331272179138, "id": "aaaa3bab:3d:1306"}, 
{"lat": 44.55033831045195, "lng": 24.312914121854526, "id": "aaaa3bab:3c:ef05"}, 
{"lat": 44.74421652327631, "lng": 24.728457702115804, "id": "aaaa3bab:3c:ea03"}, 
{"lat": 43.79401723931746, "lng": 23.77846416630604, "id": "aaaa3bab:3d:7200"}, 
{"lat": 43.67351687345779, "lng": 23.00140978137842, "id": "aaaa3bab:3d:5d07"}, 
{"lat": 43.87692500855015, "lng": 24.28543591328852, "id": "aaaa3bab:3d:550b"}, 
{"lat": 44.28189405244278, "lng": 23.972410391551893, "id": "aaaa3bab:3d:2706"}, 
{"lat": 43.94916218711252, "lng": 23.9733463072956, "id": "aaaa3bab:3d:2704"}, 
{"lat": 44.61479884874806, "lng": 24.27581898293906, "id": "aaaa3bab:3d:2608"}, 
{"lat": 44.92223011339065, "lng": 23.505887513934034, "id": "aaaa3bab:3d:6502"}, 
{"lat": 44.20117807597118, "lng": 23.70555450810448, "id": "aaaa3bab:3d:2603"}, 
{"lat": 43.547714841247966, "lng": 24.56985383484244, "id": "aaaa3bab:3d:2601"}, 
{"lat": 43.92116991202797, "lng": 22.82805535024416, "id": "aaaa3bab:3d:5803"}, 
{"lat": 44.56587414638437, "lng": 22.970799697228976, "id": "aaaa3bab:3d:7406"}, 
{"lat": 44.10230727065641, "lng": 23.701204095342597, "id": "aaaa3bab:3d:7407"}, 
{"lat": 45.25416535851712, "lng": 24.434312172789625, "id": "aaaa3bab:3d:7404"}, 
{"lat": 44.91647619491961, "lng": 23.678252259828515, "id": "aaaa3bab:3d:7405"}, 
{"lat": 45.03473433359779, "lng": 24.07596179597473, "id": "aaaa3bab:3d:7402"}, 
{"lat": 45.16855171992733, "lng": 23.435986773864467, "id": "aaaa3bab:3d:7403"}, 
{"lat": 44.553669079256146, "lng": 23.05123326220677, "id": "aaaa3bab:3d:7400"}, 
{"lat": 43.32871087231798, "lng": 23.325707869122013, "id": "aaaa3bab:3d:5308"}, 
{"lat": 43.40444516345915, "lng": 23.485798521785892, "id": "aaaa3bab:3c:f107"}, 
{"lat": 43.9435337313432, "lng": 22.968285824722354, "id": "aaaa3bab:3d:7401"}, 
{"lat": 44.74549949495889, "lng": 22.832034225254052, "id": "aaaa3bab:3d:7408"}, 
{"lat": 44.34901730307382, "lng": 24.33506529636527, "id": "aaaa3bab:3d:7409"}, 
{"lat": 43.53125851464172, "lng": 24.763229039168245, "id": "aaaa3bab:3d:6602"}, 
{"lat": 44.155575603194634, "lng": 23.250881840942217, "id": "aaaa3bab:3c:e300"}]
}}
test_data.edge = { list:[
{"source": test_data.node.list[1], "target": test_data.node.list[25]}, 
{"source": test_data.node.list[1], "target": test_data.node.list[26]}, 
{"source": test_data.node.list[1], "target": test_data.node.list[27]}, 
{"source": test_data.node.list[1], "target": test_data.node.list[28]}, 
{"source": test_data.node.list[1], "target": test_data.node.list[29]}, 
{"source": test_data.node.list[1], "target": test_data.node.list[30]}, 
{"source": test_data.node.list[1], "target": test_data.node.list[31]}, 
{"source": test_data.node.list[1], "target": test_data.node.list[34]}, 
{"source": test_data.node.list[1], "target": test_data.node.list[35]}, 
{"source": test_data.node.list[1], "target": test_data.node.list[36]}, 
{"source": test_data.node.list[3], "target": test_data.node.list[5]}, 
{"source": test_data.node.list[3], "target": test_data.node.list[6]}, 
{"source": test_data.node.list[4], "target": test_data.node.list[15]}, 
{"source": test_data.node.list[4], "target": test_data.node.list[9]}, 
{"source": test_data.node.list[5], "target": test_data.node.list[19]}, 
{"source": test_data.node.list[5], "target": test_data.node.list[23]}, 
{"source": test_data.node.list[6], "target": test_data.node.list[18]}, 
{"source": test_data.node.list[6], "target": test_data.node.list[20]}, 
{"source": test_data.node.list[7], "target": test_data.node.list[22]}, 
{"source": test_data.node.list[8], "target": test_data.node.list[37]}, 
{"source": test_data.node.list[8], "target": test_data.node.list[3]}, 
{"source": test_data.node.list[10], "target": test_data.node.list[11]}, 
{"source": test_data.node.list[17], "target": test_data.node.list[21]}, 
{"source": test_data.node.list[18], "target": test_data.node.list[13]}, 
{"source": test_data.node.list[18], "target": test_data.node.list[14]}, 
{"source": test_data.node.list[19], "target": test_data.node.list[33]}, 
{"source": test_data.node.list[19], "target": test_data.node.list[38]}, 
{"source": test_data.node.list[23], "target": test_data.node.list[2]}, 
{"source": test_data.node.list[25], "target": test_data.node.list[10]}, 
{"source": test_data.node.list[28], "target": test_data.node.list[4]}, 
{"source": test_data.node.list[28], "target": test_data.node.list[17]}, 
{"source": test_data.node.list[29], "target": test_data.node.list[32]}, 
{"source": test_data.node.list[32], "target": test_data.node.list[25]}, 
{"source": test_data.node.list[34], "target": test_data.node.list[24]}, 
{"source": test_data.node.list[35], "target": test_data.node.list[8]}, 
{"source": test_data.node.list[35], "target": test_data.node.list[16]}, 
{"source": test_data.node.list[37], "target": test_data.node.list[7]}, 
{"source": test_data.node.list[37], "target": test_data.node.list[12]}
]}

var sliver = { flows: 
      { '51247': 
         { protocol: 'UDP',
           totalSize: 98,
           totalAverage: 98,
           parts: [ { from: '192-168-2-12', to: '10-1-2-53', size: 98 } ] },
        '53324': 
         { protocol: 'TCP',
           totalSize: 1353,
           totalAverage: 677,
           parts: 
            [ { from: '192-168-2-30', to: '184-72-244-65', size: 1333 },
              { from: '184-72-244-65', to: '192-168-2-30', size: 20 } ] },
        '53326': 
         { protocol: 'TCP',
           totalSize: 1686,
           totalAverage: 562,
           parts: 
            [ { from: '192-168-2-30', to: '184-72-244-65', size: 1626 },
              { from: '184-72-244-65', to: '192-168-2-30', size: 60 } ] },
        '53343': 
         { protocol: 'TCP',
           totalSize: 92,
           totalAverage: 46,
           parts: 
            [ { from: '173-194-34-119', to: '192-168-2-30', size: 72 },
              { from: '192-168-2-30', to: '173-194-34-119', size: 20 } ] },
        '53368': 
         { protocol: 'TCP',
           totalSize: 1236,
           totalAverage: 412,
           parts: 
            [ { from: '192-168-2-30', to: '74-86-70-107', size: 1176 },
              { from: '74-86-70-107', to: '192-168-2-30', size: 60 } ] } },
     nodes: 
      { '192-168-2-30': 
         { ip: '192.168.2.30',
           bandwidthUtilization: 4367,
           flows: [ 53326, 53368, 53324, 53343 ] },
        '184-72-244-65': 
         { ip: '184.72.244.65',
           bandwidthUtilization: 3039,
           flows: [ 53326, 53324 ] },
        '74-86-70-107': 
         { ip: '74.86.70.107',
           bandwidthUtilization: 1236,
           flows: [ 53368 ] },
        '173-194-34-119': 
         { ip: '173.194.34.119',
           bandwidthUtilization: 92,
           flows: [ 53343 ] },
        '192-168-2-12': 
         { ip: '192.168.2.12',
           bandwidthUtilization: 98,
           flows: [ 51247 ] },
        '10-1-2-53': { ip: '10.1.2.53', bandwidthUtilization: 98, flows: [ 51247 ] } },
     edges: 
      { '192-168-2-30-184-72-244-65': 
         { from: '192-168-2-30',
           to: '184-72-244-65',
           currentUtilization: 2959,
           flows: [ 53326, 53324 ] },
        '184-72-244-65-192-168-2-30': 
         { from: '184-72-244-65',
           to: '192-168-2-30',
           currentUtilization: 80,
           flows: [ 53326, 53324 ] },
        '192-168-2-30-74-86-70-107': 
         { from: '192-168-2-30',
           to: '74-86-70-107',
           currentUtilization: 1176,
           flows: [ 53368 ] },
        '74-86-70-107-192-168-2-30': 
         { from: '74-86-70-107',
           to: '192-168-2-30',
           currentUtilization: 60,
           flows: [ 53368 ] },
        '173-194-34-119-192-168-2-30': 
         { from: '173-194-34-119',
           to: '192-168-2-30',
           currentUtilization: 72,
           flows: [ 53343 ] },
        '192-168-2-12-10-1-2-53': 
         { from: '192-168-2-12',
           to: '10-1-2-53',
           currentUtilization: 98,
           flows: [ 51247 ] },
        '192-168-2-30-173-194-34-119': 
         { from: '192-168-2-30',
           to: '173-194-34-119',
           currentUtilization: 20,
           flows: [ 53343 ] } },
     devices: 
      { 'c0-f8-da-45-01-3b': { mac: 'c0:f8:da:45:01:3b', ip: [ '192-168-2-30' ] },
        '00-0c-66-10-19-5f': 
         { mac: '00:0c:66:10:19:5f',
           ip: [ '184-72-244-65', '74-86-70-107', '173-194-34-119', '10-1-2-53' ] },
        'ec-55-f9-4e-3d-b7': { mac: 'ec:55:f9:4e:3d:b7', ip: [ '192-168-2-12' ] } } }
		;


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

        //var dsrc = new google.maps.LatLng(node_coord[d.source-1 + "," + 1], node_coord[d.source-1 + "," + 0]);
        //var dtrg = new google.maps.LatLng(node_coord[d.target-1 + "," + 1], node_coord[d.target-1 + "," + 0]);
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

