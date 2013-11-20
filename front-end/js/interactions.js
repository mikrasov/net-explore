  var elementSelected = null;

  var sidebar = d3.select("#sidebar");
  var filters = { 
	duration: d3.select("#filter-duration").node(),
	protocol: d3.select("#filter-protocol").node(),
	network: d3.select("#filter-network").node()
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
  
   
  function updateSidebar(){
	var txt = "";
	var data = sidebar.datum();
	
	if(data != undefined ){
		for (var key in data.data) {
			var value = data.data[key];
			txt += "<strong>"+ key + "</strong> ";
			
			if(key == "flows"){
				var fls = (new String(value)).split(",");
				for (var f in fls){;
					txt += "<a href='#' onClick='selectElement(\"flow\",\""+fls[f]+"\")'>"+fls[f]+"</a>, ";
				}
			}
			else if(key == "from" || key == "to"){
				txt += "<a href='#' onClick='selectElement(\"node\",\""+value+"\")'>"+value+"</a>";
			}
			else if(key == "parts"){
				txt += "<br/>";
				for (var p in value){
					var part = value[p];
					txt += "<a href='#' onClick='selectElement(\"node\",\""+part.from+"\")'>"+part.from+"</a>";
					txt += " <a href='#' onClick='selectElement(\"edge\",\""+part.from+"-"+part.to+"\")'>&#8594;</a> ";
					txt += "<a href='#' onClick='selectElement(\"node\",\""+part.to+"\")'>"+part.to+"</a>";
					txt += "<br>";
				}
			}
			else if(key == "geo"){
				txt +="<ul>";
				for(g in value){
					if(g == "_id" || g == "ip" || g == "hostname") continue;
					txt += "<li>";
					txt += g + ": ";
					txt += value[g];
					txt += "<br>\n";
					txt += "</li>";
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
		console.log(d3.select("#node-"+data.id));
	}
	else if(data.type == "edge"){
		d3.select("#edge-"+data.id)
		  .classed("selected", true)
		  .style('marker-end', function(d) { return 'url(#end-arrow-selected)'; })
	}else if(data.type == "flow"){
		
		for (var key in data.data.parts) {
			var value = data.data.parts[key];
			d3.select("#node-"+value.from).classed("selected", true);
			d3.select("#node-"+value.to).classed("selected", true);
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
	
	return true;
  }
  
  function linkDistance(data){
	if(data.source.network == "public" || data.target.network == "public")
		return 250;
		
	return 500;
  }
  
  function linkStrength(data){
	if(data.source.network == "public" || data.target.network == "public")
		return 0.1;
		
	return 1;
  }
  
  function createPath(sourceX, sourceY, sourceXPadding, sourceYPadding,
					targetX, targetY, targetXPadding, targetYPadding){
	var deltaX = targetX - sourceX,
        deltaY = targetY - sourceY,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
		normX = deltaX / dist,
        normY = deltaY / dist,
		spacingX = (Math.abs(deltaX) < Math.abs(deltaY))?((deltaY > 0)? 10 : -10):0,
		spacingY = (Math.abs(deltaX) > Math.abs(deltaY))?((deltaX > 0)? -10 : 10):0,
		srcX = sourceX + (sourceXPadding * normX)+spacingX,
        srcY = sourceY + (sourceYPadding * normY)+spacingY,
        tgtX = targetX - (targetXPadding * normX)+spacingX,
        tgtY = targetY - (targetYPadding * normY)+spacingY;
		dx = targetX - sourceX,
		dy = targetY - sourceY,
		dr = Math.sqrt(dx * dx + dy * dy) *3;
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
		.classed("filtered", invertFilter(elementFilter));
		

	  // remove old links
	  edges.exit().remove();
	  
	  return edges;
 }
 
