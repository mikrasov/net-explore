var fs = require('fs');

var parsedJSON = require('./ports.json');
		var output = {};
		
		for(r in parsedJSON){
			var obj = {};
			var result = parsedJSON[r];
			
			var minPort;
			var maxPort;
			
			if(result.Port.indexOf("-") !== -1){
				var portRange = result.Port.split("-");
				minPort = portRange[0].trim();
				maxPort = portRange[1].trim();
			}
			else{
				minPort = result.Port.trim();
				maxPort = result.Port.trim();
			}
			
			obj.port = result.Port;
			obj.type = result.Type;
			obj.tcp = (result.TCP.indexOf("TCP") !== -1 || result.UDP.indexOf("TCP") !== -1);
			obj.udp = (result.TCP.indexOf("UDP") !== -1 || result.UDP.indexOf("UDP") !== -1);
			obj.description = result.Description;

			for (var port=minPort;port<=maxPort;port++){ 
			
				if(typeof output[port] == "undefined")
					output[port] = [];
				
				output[port].push(obj);
				//console.log(result);
			}
			
			
			
		}
		

		var outputFilename = 'sample_ports.json';

		fs.writeFile(outputFilename, JSON.stringify(output, null, 4), function(err) {
			if(err) {
			  console.log(err);
			} else {
			  console.log("JSON saved to "+outputFilename);
			}
		}); 


