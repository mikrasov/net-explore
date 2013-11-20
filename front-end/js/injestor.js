
function proccessData(map){
	
	if(typeof map == "undefined" || map == null){
		console.log("NO DATA");
		return;
	}
	
	var timestamp = map.time;
	
	function proccess(type, maping){
		for (var key in maping) {	
			var data = maping[key];
			
			//Create Object if one doesn't exist and set fields
			var exists = graph[type].dict[key] != undefined;
			var entry = (exists? graph[type].dict[key] : graph[type].dict[key] = new Object());
			entry.id 		= key;
			entry.type		= type;
			entry.data		= data;
			entry.lastSeen	= timestamp;
			
			if(!exists){
				graph[type].list.push(entry);
				graph[type].count++;
			}
			
			if(type == "node"){
				entry.incoming	= entry.incoming || [];
				entry.outgoing	= entry.outgoing || [];
				
				if(typeof data.geo != "undefined" && typeof data.geo.loc != "undefined"){
					var gps = data.geo.loc.split(",");
					entry.lat = gps[0];
					entry.lng = gps[1];
					entry.gpsSet = true;
				}
				
				
				
				if(typeof sample_gps[data.ip] != "undefined" && typeof sample_gps[data.ip].loc  != "undefined"){
					console.log("loading from GPS cache");
					console.log( sample_gps[data.ip] );
					data.geo= sample_gps[data.ip];
					
					var gps = data.geo.loc.split(",");
					entry.lat = gps[0];
					entry.lng = gps[1];
					entry.gpsSet = true;
				}
				else{
				
					//for now position local nodes around macha

					
					if(data.network == "private"){
						entry.lat = -16.424808 + (Math.random() *0.1);
						entry.lng = 26.77557 + (Math.random() *0.1);
					}
					else{
						entry.lat = -85 + (Math.random() *5);
						entry.lng = -180 + (Math.random() *360);
					}
					entry.gpsSet = false;
				}
		
				entry.network = data.network;		
			}
			
			//Add Connectedness to edges
			if(type == "edge"){
				var src = graph.node.dict[data.from]; //E
				var dest = graph.node.dict[data.to];  //E
				
				entry.source	= src;
				entry.target	= dest;

				src.outgoing[dest.id] = entry;	
				dest.incoming[src.id] = entry;	
			}	
		}
	}
	
	proccess("device", map.devices);
	proccess("flow", map.flows);
	proccess("node", map.nodes);
	proccess("edge", map.edges);

	updateLayout();
	
	//console.log(graph);
}