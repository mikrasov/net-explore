
function proccessData(map){
	
	function calcDistance(lat1, lon1, lat2, lon2){
		var R = 6371; // km
		return Math.acos(Math.sin(lat1)*Math.sin(lat2) + 
                  Math.cos(lat1)*Math.cos(lat2) *
                  Math.cos(lon2-lon1)) * R;
	}
	
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
					data.geo= sample_gps[data.ip];
					
					var gps = data.geo.loc.split(",");
					entry.lat = gps[0];
					entry.lng = gps[1];
					entry.gpsSet = true;
				}
				else if(typeof entry.lat == "undefined") {
				
					//for now position local nodes around macha

					
					if(data.network == "private"){
						entry.lat = -16.424808 + (Math.random() *0.01);
						entry.lng = 26.77557 + (Math.random() *0.01);
						entry.gpsSet = true;
					}
					else{
						entry.lat = 0;
						entry.lng = 0;
						entry.gpsSet = false;
					}
					
				}
		
				entry.network = data.network;		
			}
			
			//Add Connectedness to edges
			if(type == "edge"){
				var src = graph.node.dict[data.from]; 
				var dest = graph.node.dict[data.to];  
				
				entry.source	= src;
				entry.target	= dest;

				src.outgoing[dest.id] = entry;	
				dest.incoming[src.id] = entry;	
				
				
				//calculate distance
				if(src.gpsSet && dest.gpsSet){
				
					data.distance = calcDistance(src.lat,src.lng, dest.lat, dest.lng);
					entry.gpsSet = true;
				}
				else{
					entry.gpsSet = false;
				}
			}	
			
			if(type == "flow"){
				if(typeof sample_ports[data.sourcePort] != "undefined") {
					data.srcApp = sample_ports[data.sourcePort];
				}
				if(typeof sample_ports[data.destPort ] != "undefined") {
					data.dstApp = sample_ports[data.destPort ];
				}
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