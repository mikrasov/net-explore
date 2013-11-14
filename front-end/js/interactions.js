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
		if(data.type=="node" && data.network == "public"){
			d3.json("http://ipinfo.io/"+data.data.ip+"/json", function(json) {
				var addTxt = "";
				for (var k in json) {
					addTxt +=  "<strong>"+ k + "</strong> ";
					addTxt +=  json[k]+ " <br>\n";
				}
				d3.select("#additional-info").html(addTxt);
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
			d3.select("#node-"+value.from).classed("selected", true);
			d3.select("#node-"+value.to).classed("selected", true);
			d3.select("#edge-"+graph.node.dict[value.from].outgoing[value.to].id)
			  .style('marker-end', function(d) { return 'url(#end-arrow-selected)'; })
			  .classed("selected", true);	
		}
	}
	
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
  
  