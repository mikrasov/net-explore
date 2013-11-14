var longitudinalCounter = 0;
var latitudinalCounter = 0;
function proccessData(map, timestamp){

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
				
				if(data.lat == undefined || data.lng == undefined){
					entry.lat = 85; //-(latitudinalCounter++/10);
					entry.lng = longitudinalCounter;
					longitudinalCounter += 1;
				}
		
				entry.network = "public";
				for (var ip in ipLabelTable) {
		
					if( ipLabelTable[ip].re.test(data.ip) ){
						entry.network = ipLabelTable[ip].network;
					}
				}
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
	console.log("Proccess Data: "+ timestamp);

	proccess("device", map.devices);
	proccess("flow", map.flows);
	proccess("node", map.nodes);
	proccess("edge", map.edges);


	console.log(graph);
}