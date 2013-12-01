  var elementSelected = null;

  var sidebar = d3.select("#sidebar");
  var filters = { 
	duration: d3.select("#filter-duration").node(),
	protocol: d3.select("#filter-protocol").node(),
	network: d3.select("#filter-network").node(),
	distance: d3.select("#filter-distance").node()
  };
	
  document.onkeyup = function(evt) {
	evt = evt || window.event;

	if(evt.keyCode == 27){
		cancelElementSelection();
	}
  };
	
  function cancelElementSelection(){
	if(elementSelected != null){
		elementInfoCancel();
		elementSelected = null;
		nodes.classed("selected", false);
		edges.classed("selected", false)
		  .style('marker-end', function(d) { return 'url(#end-arrow)'; });
	}
  }
  
  
  function selectElement(type, id){
	graphElementSelected(graph[type].dict[id]);
  }
  
  function elementInfoShow(data){
	sidebar.datum(data);
	updateSidebar();
  }
  
  function elementInfoCancel(){
	sidebar.datum(null);
	updateSidebar();
  }
  
  function decorateNode(data){
	return (typeof data.data.decoration != "undefined" && data.data.decoration == "end-point");
  }
  function updateSidebar(){
	var txt = "";
	var data = sidebar.datum();
	
	if(data != undefined ){
		for (var key in data.data) {
			var value = data.data[key];
			txt += "<strong>"+ key + "</strong> ";
			
			if(key == "flows"){
				var fls = (new String(value)).split(",");
				txt +="<ul>";
				for (var f in fls){;
					var flow = graph.flow.dict[fls[f]].data;
					txt += "<li><a href='#' onClick='selectElement(\"flow\",\""+fls[f]+"\")'>";
					txt+= fls[f];
					if(typeof flow.sourcePort  != "undefined" && typeof flow.destPort != "undefined")
						txt += " ["+flow.sourcePort+" -> "+flow.destPort+"]";
						
					txt += "</a>";
					txt +="<ul>";
					for(a in flow.srcApp){
						var app =flow.srcApp[a];
						
						txt +="<li>";
						txt += "<strong>"+app.port+" - ";
						if(typeof app.type != "undefined")
							txt += app.type;
						txt += ":</strong> ";
						txt += app.description;
						txt +="</li>";
						
					}
					txt +="</ul>";
					txt += "</li>";
				}
				txt +="</ul>";
			}
			else if(key == "from" || key == "to"){
				if(typeof graph.node.dict[value] != "undefined")
					txt += "<a href='#' onClick='selectElement(\"node\",\""+value+"\")'>"+value+"</a>";
				else 
					txt += value;
			}
			else if(key == "parts"){
				txt += "<br/>";
				for (var p in value){
					var part = value[p];
					
					if(typeof graph.node.dict[part.from] != "undefined")
						txt += "<a href='#' onClick='selectElement(\"node\",\""+part.from+"\")'>"+part.from+"</a>";
					else
						txt += part.from;
					
					if(typeof graph.node.dict[part.from] != "undefined" && typeof graph.node.dict[part.to] != "undefined")
						txt += " <a href='#' onClick='selectElement(\"edge\",\""+part.from+"-"+part.to+"\")'>&#8594;</a> ";
					else
						txt += "&#8594;";
					
					if(typeof graph.node.dict[part.to] != "undefined")
						txt += "<a href='#' onClick='selectElement(\"node\",\""+part.to+"\")'>"+part.to+"</a>";
					else
						txt += part.to;
					txt += "<br>";
				}
			}
			else if(key == "geo"){
				txt +="<ul>";
				for(g in value){
					if(g == "_id" || g == "ip" || g == "hostname") continue;
					txt += "<li>";
					txt += g + ": ";
					
					if(g == "loc"){
						var loc = (new String(value[g])).split(",");
						txt += '<a href="#" onClick="goTo('+loc[0]+","+loc[1]+')" >';
						txt += value[g];
						txt += "</a>";
					}
					else
						txt += value[g];
					
					
					txt += "<br>\n";
					txt += "</li>";
					
					
				}
				txt +="</ul>";
			}
			else if(key == "utilization"){
				txt +="<ul>";
				for(g in value){
					txt += "<li>";
					txt += g + ": ";
					txt += value[g];
					txt += " b/s<br>\n";
					txt += "</li>";
				}
				txt +="</ul>";
			}
			else if(key == "delay"){
				txt += value+" ms";
			}
			else if(key == "distance"){
				txt += value+" km";
			}
			else if(key == "totalSize"){
				txt += value+" bytes";
			}
			else if(key == "totalAverage"){
				txt += value+" bytes";
			}
			else if(key == "currentUtilization"){
				txt += value+" b/s";
			}
			else if(key == "srcApp" || key == "dstApp" ){
				txt +="<ul>";
				for(i in value){
					var app = value[i];
					txt +="<li>";
					if(typeof app.type != "undefined")
						txt += "<strong>"+app.type+":</strong> ";
					txt += app.description;
					txt +="</li>";
				}
				txt +="</ul>";
			}
			else {
				txt += value;
			}
			
			txt += "<br>\n";
		}
		txt += "<div id='additional-info'></div>\n";
				
		txt += "<br>\n<br>\n<strong>Last Seen</strong><br>\n";
		
		var lastSeen = moment.unix(data.lastSeen);
		lastSeen.zone(timeOffset);
		txt += humanTime(data.lastSeen)+"<br>\n";
		txt += lastSeen.fromNow()+"<br>\n";
		
		sidebar.html(txt).classed("old-data", markAsOld);
		
		// Do lookup of IP Location for public IPs
		if(data.type=="node" && data.network == "public" && typeof data.geo == "undefined"){
			d3.json("http://ipinfo.io/"+data.data.ip+"/json", function(json) {
				data.geo = json;
				updateSidebar();
			});
		}
	}
	else{
		sidebar.html("").classed("old-data", false);
	}
  }
  
  function graphElementHover(data){
	if(elementSelected == null) 
		elementInfoShow(data);
  }
  
  function graphElementHoverOff(data){
	if(elementSelected == null) 
		elementInfoCancel();
  }
  
  function graphElementSelected(data){
	cancelElementSelection();
	
	elementSelected = data;
	elementInfoShow(data);
	
	if(data.type == "node"){
		d3.select("#node-"+data.id).classed("selected", true);
	}
	else if(data.type == "edge"){
		d3.select("#edge-"+data.id)
		  .classed("selected", true)
		  .style('marker-end', function(d) { return 'url(#end-arrow-selected)'; })
	}else if(data.type == "flow"){
		
		for (var key in data.data.parts) {
			var value = data.data.parts[key];
			if(typeof graph.node.dict[value.from] != "undefined")
				d3.select("#node-"+value.from).classed("selected", true);
			if(typeof graph.node.dict[value.to] != "undefined")
				d3.select("#node-"+value.to).classed("selected", true);
			if(typeof graph.node.dict[value.from] != "undefined" && typeof graph.node.dict[value.to] != "undefined")
				d3.select("#edge-"+graph.node.dict[value.from].outgoing[value.to].id)
				  .style('marker-end', function(d) { return 'url(#end-arrow-selected)'; })
				  .classed("selected", true);	
		}
	}
	
  }

  function calculateDashes(data){
	var delay = Math.ceil(Math.log(data.data.delay)-5)*2;
	if(delay < 0) delay = 0;
	return ("5, "+delay);
  }

  function calculateWidth(data){
	var utilization = Math.ceil( Math.log(data.data.currentUtilization)-7)*2;
	if(utilization <= 1) utilization = 1;
	return utilization;
  }
  
  function calculateElementOpacity(data){
	var difference = (currentTime - data.lastSeen)/timeStep;

	if(difference == 0) 
		return 1;
	else if(difference < 0)
		difference = -difference;
	
	var fade = 0.90 - (0.10*Math.log(difference));

	return fade > .15? fade : 15;
  }
  
  function markAsOld(data){
	return currentTime - data.lastSeen  > 0
  }
  

  //Filter nodes displayed
  //  True == Accept
  function elementFilter(data){
  
	var duration = filters.duration.options[filters.duration.selectedIndex].value;
	var protocol = filters.protocol.options[filters.protocol.selectedIndex].value;
	var network = filters.network.options[filters.network.selectedIndex].value;
	var distance = filters.distance.options[filters.distance.selectedIndex].value;
	
	//Check duration
	if(duration != "" && currentTime - data.lastSeen >= duration){
		return false;
	}
 
	//Check protocol
	if(protocol != "" ){
		var contains = false;
		var flows = data.data.flows;
		for (var f in flows) {
			var flow = graph.flow.dict[flows[f]];
			console.log(flow.data.protocol.toLowerCase()  +" - "+protocol);
			if( flow.data.protocol.toLowerCase() == protocol){
				contains = true;
				break;
			}
		}
		
		if(!contains) return false;
	}
	
	//Network filter
	if(network != ""){
		if(data.type == "node" && data.network != network)
			return false;
		if(data.type == "edge" && (data.source.network != network || data.target.network != network))
			return false;
	}

	//Distance filter
	if(distance != ""){
		if(data.type == "edge" && data.data.distance > distance)
			return false;
	}
	
	return true;
  }
  
  function linkDistance(data){
	if(data.source.network == "public" || data.target.network == "public")
		return 250;
		
	return 400;
  }
  
  function linkStrength(data){
	
	if(data.source.network == "public" || data.target.network == "public")
		return 0.1;
		
	return 0.5;
  }
  
  function createPath(sourceX, sourceY, sourceXPadding, sourceYPadding,
					targetX, targetY, targetXPadding, targetYPadding){
	var deltaX = targetX - sourceX;
    var deltaY = targetY - sourceY;
    var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	var normX = deltaX / dist;
    var normY = deltaY / dist;
	if(dist == 0 ){
		normX=0;
		normY=0;
	}
	var spacingX = (Math.abs(deltaX) < Math.abs(deltaY))?((deltaY > 0)? 10 : -10):0;
	var spacingY = (Math.abs(deltaX) > Math.abs(deltaY))?((deltaX > 0)? -10 : 10):0;
	var srcX = sourceX + (sourceXPadding * normX)+spacingX;
    var srcY = sourceY + (sourceYPadding * normY)+spacingY;
    var tgtX = targetX - (targetXPadding * normX)+spacingX;
    var tgtY = targetY - (targetYPadding * normY)+spacingY;
	var dx = targetX - sourceX;
	var dy = targetY - sourceY;
	var dr = Math.sqrt(dx * dx + dy * dy) *3;
	return "M" + srcX + "," + srcY + "A" + dr + "," + dr + " 0 0,1 " + tgtX + "," + tgtY;
  }
  
  function appendMarkers(svg){
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
	.classed("selected", true)
    .attr("refX", 6) 
	.attr("viewBox", "0 -5 10 10")
    .attr("markerWidth", 3)
    .attr("markerHeight", 3)
	.attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5 Z"); //this is actual shape for arrowhead
 
 svg.append("defs").append("marker")
    .attr("id", "start-arrow-selected")
	.classed("selected", true)
    .attr("refX", 4) 
	.attr("viewBox", "0 -5 10 10")
    .attr("markerWidth", 3)
    .attr("markerHeight", 3)
	.attr("orient", "auto")
    .append("path")
    .attr("d", "M10,-5L10,0L10,5 Z"); //this is actual shape for arrowhead
 
 }
 
 function designEdges(edges){
	// path (link) group
	  edges = edges.data(graph.edge.list, function(d) { return d.id; });

	  // update existing links
	  edges
	  .style("opacity", calculateElementOpacity)
	  .style("stroke-width", calculateWidth)
	  .style("stroke-dasharray", calculateDashes)
	  .classed("old-data", markAsOld)
	  .classed("filtered", invertFilter(elementFilter));
	  
	   
	  // add new links
	  edges.enter().append('svg:path')
		.attr('class', 'edge')
		.attr("id", function(d) { return "edge-" + d.id; })
		.style('marker-end', function(d) { return 'url(#end-arrow)'; })
		.style("stroke-width", calculateWidth)
		.style("stroke-dasharray", calculateDashes)
		.on("mouseover", graphElementHover)
		.on("mouseout", graphElementHoverOff)
		.on("click", graphElementSelected)
		.classed("no-gps", function(data){return !data.gpsSet;})
		.classed("filtered", invertFilter(elementFilter));
		

	  // remove old links
	  edges.exit().remove();
	  
	  return edges;
 }
 
 function goTo(lat,lng){
	if(layoutType == "map"){
		map.setCenter(new google.maps.LatLng( lat,lng) );
		map.setZoom(5);
	}
 }
