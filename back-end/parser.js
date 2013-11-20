/*
Parser
CS284 Project
Leah Chatkeonopadol
Michael Nekrasov
Fall 2013
*/

parse("./data/eth1_eth2_20120204172604.pcapy");

function parse(filename, socket){

	console.log("Parsing: '"+filename+"'");
	
	var fs = require('fs');
	fs.stat(filename, function(err, stat) {
    if(err == null) {
        console.log('File exists');
    } else {
        console.log('Some other error: ', err.code);
    }
	});
	
	console.log("OPEN DB");
	
	// set up for database
	var MongoClient = require('mongodb').MongoClient, format = require('util').format;

	// IP lookup table
	var ipLabelTable = [
		{ re: /(^127\.0\.0\.1)/, network: "localhost" },
		{ re: /(^10\.)/, network: "private" },
		{ re: /(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)/, network: "private" },
		{ re: /(^192\.168\.)/, network: "private" } ];

	// this function makes it easier to check if a flow and a node or a flow and an edge
	// are already correlated
	// code taken from StackOverflow, question #1181575
	Array.prototype.contains = function(k) {
		for (var p in this)
			if (this[p] === k)
				return true;
		return false;
	}

	// this function is for calculating the delay in the network
	// use a running average
	Array.prototype.runningAverage = function(average, count) {
		var total = 0;
		for (var i=0; i<this.length; i++) {
			total = total + this[this.length - 1 - i];
		}
		total = total/this.length;
		var runningAverage = average*count + total;
		runningAverage = runningAverage/(count + 1);
		return runningAverage;
	}

	var data = 0;
	var currentTime = 0;
	var counter = 0;

	// open connection to database
	MongoClient.connect('mongodb://54.243.234.208/test', function(err, db) {
		if (err) { 
			console.log("Error connecting");
			throw err; 
		}

		var database = db.collection('time_slicers');

		// the following code is for clearing out old data in the database
		/* database.remove( function(err, db) {
			if (err) {throw err; }
		}); */

		// function parse(filename) {

		console.log("starting PCAP");
		// set up for pcap session
		var pcap = require('pcap'),
		pcap_session = pcap.createOfflineSession(filename,"");

		console.log("parsing PCAP");
		// start processing pcap file
		pcap_session.on('packet', function(raw_packet) {

			// console.log("pcap session started");

			var util = require('util');
			var fs = require('fs');
			var packet = pcap.decode.packet(raw_packet);

			// divide time into 1s pieces
			var time = packet.pcap_header.time_ms;
			time = Math.floor(time/1000);

			// filter out non-TCP/UCP packets
			if (packet.link.ethertype === 0) {}                     // what is this?
			else if (packet.link.ethertype === 2054) {}             // ARP
			else if (packet.link.ethertype === 35020) {}            // LLDP (not implemented)
			else if (packet.link.ethertype === 34525) {}            // IPv6 (IP addresses given in hex)
			else if (packet.link.ip.protocol_name === "IGMP") {}    // IGMP
			else if (packet.link.ip.protocol_name === "ICMP") {}    // ICMP
			else {

				// pre-processing
				var JSONpacket = { "sourceIP": packet.link.ip.saddr,
								   "sourceMAC": packet.link.shost,
								   "destIP": packet.link.ip.daddr,
								   "destMAC": packet.link.dhost,
								   "protocol": packet.link.ip.protocol_name,
								   "time": packet.pcap_header.time_ms };

				if (JSONpacket[ "protocol" ] === "TCP") {
					JSONpacket[ "size" ] = packet.link.ip.header_bytes + packet.link.ip.tcp.data_bytes;
					if (packet.link.ip.tcp.sport > packet.link.ip.tcp.dport) {
						JSONpacket[ "port" ] = packet.link.ip.tcp.sport;
					} else {
						JSONpacket[ "port" ] = packet.link.ip.tcp.dport;
					}
					JSONpacket[ "seq" ] = packet.link.ip.tcp.seqno;
					JSONpacket[ "ack" ] = packet.link.ip.tcp.ackno;
				} else if (JSONpacket[ "protocol" ] === "UDP") {
					JSONpacket[ "size" ] = packet.link.ip.header_bytes + packet.link.ip.udp.data_bytes;

					// manually filter out port 61655
					// for this port, use the other port number, even if it's smaller
					if (packet.link.ip.udp.sport == 61655) {
						JSONpacket[ "port" ] = packet.link.ip.udp.dport;
					} else if (packet.link.ip.udp.dport == 61655) {
						JSONpacket[ "port" ] = packet.link.ip.udp.sport;
					} else {
						if (packet.link.ip.udp.sport > packet.link.ip.udp.dport) {
							JSONpacket[ "port" ] = packet.link.ip.udp.sport;
						} else {
							JSONpacket[ "port" ] = packet.link.ip.udp.dport;
						}
					}
				} else {
					JSONpacket[ "size" ] = packet.link.ip.header_bytes;
					JSONpacket[ "port" ] = 0;
				}

				// check the time
				// if 1 second has passed, process the data
				// else, continue collecting data
				if (time === currentTime) {
					data.push(JSONpacket);
				} else {
					if (data != 0) {
						perSecond(currentTime, data);
					}
					data = [];
					currentTime = time;
					data.push(JSONpacket);
				}

				// console.log(data);

			}

		});

		// maintain a table of packets in order to determine delay in the network
		var packetTable = {};
		var average = 0;
		var count = 0;

		// maintain a table of edges in order to track delay per edge
		var edgeTable = {};

		// this function is for updating the global table of delays per edge
		function updateEdgeDelay(edgeID, diff) {
			var newDelay = edgeTable[ edgeID ].average*edgeTable[ edgeID ].count + diff;
			edgeTable[ edgeID ].count = edgeTable[ edgeID ].count + 1;
			newDelay = newDelay / edgeTable[ edgeID ].count;
			edgeTable[ edgeID ].average = newDelay;
		}

		// process each second's worth of data
		function perSecond(time, data) {

			var i;
			var j;
			var nodes = {};
			var flows = {};
			var edges = {};
			var summary = {};
			var devices = {};
			var delay = [];
			var channel = 0;

			for (i=0; i<data.length; i++) {

				// extract node and device information
				// use replace three times to exchange "-" for "." in nodeIDs
				// use replace five times to exchange "-" for ":" in deviceIDs
				var sourceNodeID = (data[i].sourceIP).replace(".","-");
				sourceNodeID = sourceNodeID.replace(".","-");
				sourceNodeID = sourceNodeID.replace(".","-");

				var nodeInfo = { "ip": data[i].sourceIP,
								 "network": "public",
								 "flows": [] };
				var utilization = { "incoming": 0,
									"outgoing": data[i].size,
									"total": data[i].size };

				if (data[i].protocol === "TCP") {
					utilization[ "TCP" ] = data[i].size;
					utilization[ "UDP" ] = 0;
				} else if (data[i].protocol === "UDP") {
					utilization[ "TCP" ] = 0;
					utilization[ "UDP" ] = data[i].size;
				} else {
					utilization[ "TCP" ] = 0;
					utilization[ "UDP" ] = 0;
				}

				nodeInfo[ "utilization" ] = utilization;

				for (var ip=0; ip<4; ip++) {
					if (ipLabelTable[ip].re.test(data[i].sourceIP)) {
						nodeInfo[ "network" ] = ipLabelTable[ip].network;
					}
				}

				if (nodes[ sourceNodeID ] === undefined) {
					nodes[ sourceNodeID ] = nodeInfo;
				} else {
					nodes[ sourceNodeID ].utilization.total = nodes[ sourceNodeID ].utilization.total +
															  data[i].size;
					nodes [ sourceNodeID ].utilization.outgoing = nodes[ sourceNodeID ].utilization.outgoing +
																  data[i].size;

					if (data[i].protocol === "TCP") {
						nodes [ sourceNodeID ].utilization.TCP = nodes[ sourceNodeID ].utilization.TCP +
																 data[i].size;
					} else if (data[i].protocol === "UDP") {
					nodes [ sourceNodeID ].utilization.UDP = nodes[ sourceNodeID ].utilization.UDP +
															 data[i].size;
					}
				}

				var deviceID = (data[i].sourceMAC).replace(":","-");
				deviceID = deviceID.replace(":","-");
				deviceID = deviceID.replace(":","-");
				deviceID = deviceID.replace(":","-");
				deviceID = deviceID.replace(":","-");

				if (devices[ deviceID ] === undefined) {
					devices[ deviceID ] = { "mac": data[i].sourceMAC,
											"ip": [sourceNodeID] };
				} else {
					if (!devices[ deviceID ].ip.contains(sourceNodeID)) {
						devices[ deviceID ].ip.push(sourceNodeID);
					}
				}

				var destNodeID = (data[i].destIP).replace(".","-");
				destNodeID = destNodeID.replace(".","-");
				destNodeID = destNodeID.replace(".","-");

				nodeInfo = { "ip": data[i].sourceIP,
							 "network": "public",
							 "flows": [] };
				utilization = { "incoming": data[i].size,
								"outgoing": 0,
								"total": data[i].size,
								"TCP": 0,
								"UDP": 0 };

				nodeInfo[ "utilization" ] = utilization;

				for (var ip=0; ip<4; ip++) {
					if (ipLabelTable[ip].re.test(data[i].destIP)) {
						nodeInfo[ "network" ] = ipLabelTable[ip].network;
					}
				}

				if (nodes[ destNodeID ] === undefined) {
					nodes[ destNodeID ] = nodeInfo;
				} else {
					nodes[ destNodeID ].utilization.total = nodes[ destNodeID ].utilization.total +
															data[i].size;
					nodes [ destNodeID ].utilization.incoming = nodes[ destNodeID ].utilization.incoming +
																data[i].size;
				}

				deviceID = (data[i].destMAC).replace(":","-");
				deviceID = deviceID.replace(":","-");
				deviceID = deviceID.replace(":","-");
				deviceID = deviceID.replace(":","-");
				deviceID = deviceID.replace(":","-");

				if (devices[ deviceID ] === undefined) {
					devices[ deviceID ] = { "mac": data[i].destMAC,
											"ip": [destNodeID] };
				} else {
					if (!devices[ deviceID ].ip.contains(destNodeID)) {
						devices[ deviceID ].ip.push(destNodeID);
					}
				}

				// check to see if the edge already exists
				// if not, create new edge
				var edgeID = sourceNodeID + "-" + destNodeID;
				if (edges[ edgeID ] === undefined) {
					edges[ edgeID ] = { "from": sourceNodeID,
										"to": destNodeID,
										"currentUtilization": data[i].size,
										"flows": [] };
					edgeTable[ edgeID ] = { "average": 0, "count": 0 };
				} else {
					edges[ edgeID ].currentUtilization = edges[ edgeID ].currentUtilization +
														 data[i].size;
				}

				// check to see if this flow already exists
				// if not, create new flow
				var flowID = data[i].port;

				if ( flows[ flowID ] === undefined) {
					flows[ flowID ] = { "protocol": data[i].protocol,
										"totalSize": data[i].size,
										"totalAverage": data[i].size,
										"parts": [] };
				} else {

					/* var flag = false;

					// see if this is really part of an existing flow
					for (j=0; j<flows[ flowID ].parts.length; j++) {
						if (flows[ flowID ].parts[j].from === data[i].sourceIP ||
							flows[ flowID ].parts[j].from === data[i].destIP ||
							flows[ flowID ].parts[j].to === data[i].sourceIP ||
							flows[ flowID ].parts[j].to === data[i].destIP ) {
								flag = true;
						}
					} */

					/* if (flows[ flowID ].num != 0) {
						if (Math.abs(data[i].num - flows[ flowID ].num) > 2) {
							console.log("Error!");
							console.log(data[i].num);
							console.log(flows[ flowID ].num);
							console.log(data[i].sourceIP);
							console.log(data[i].destIP);
							console.log(flows[ flowID ].parts);
						} else {
							flows[ flowID ].num = data[i].num;
						}
					} */

					flows[ flowID ].totalSize = flows[ flowID ].totalSize +
												data[i].size;
					flows[ flowID ].totalAverage = Math.round(flows[ flowID ].totalSize /
												   (flows[ flowID ].parts.length + 1));

				}

				// correlate edge and flow information
				var partInfo = { "from": sourceNodeID,
								 "to": destNodeID,
								 "size": data[i].size };

				if (edges[ edgeID ].flows.contains(flowID)) {

					// find the correct part within the flow and sum the size of packets
					// transmitted using this link
					for (j=0; j<flows[ flowID ].parts.length; j++) {

						if (flows[ flowID ].parts[j].from === partInfo.from) {
							if (flows[ flowID ].parts[j].to === partInfo.to) {
								flows[ flowID ].parts[j].size = flows[ flowID ].parts[j].size +
																partInfo.size;
							}
						}

					}

				} else {
					edges[ edgeID ].flows.push(flowID);
					flows[ flowID ].parts.push(partInfo);
				}

				// correlate node and flow information
				if (nodes[ sourceNodeID ].flows.contains(flowID)) {}
				else {
					nodes[ sourceNodeID ].flows.push(flowID);
				}
				if (nodes[ destNodeID ].flows.contains(flowID)) {}
				else {
					nodes[ destNodeID ].flows.push(flowID);
				}

				// check the packet against the global packet table
				// try to find the previous packet
				// if it is there, note the delay between the two packets
				var lookupID = destNodeID + "-" + sourceNodeID;
				if (data[i].seq != undefined) {
					packetTable[ edgeID ] = { "seq": data[i].seq,
											  "ack": data[i].ack,
											  "time": data[i].time };
					if (packetTable[ lookupID ] != undefined) {
						if (packetTable[ lookupID ].ack === data[i].seq) {
							var diff = data[i].time - packetTable[ lookupID ].time;
							// console.log("************************************************");
							// console.log("************************************************");
							// console.log(diff);
							// var util = require('util');
							// console.log(util.inspect(data[i], { showHidden: true, depth: null }));
							delay.push(diff);
							updateEdgeDelay(edgeID, diff);
							updateEdgeDelay(lookupID, diff);
							delete packetTable[ lookupID ];
						}
					}
				}

				// sum channel utilization for the entire network
				channel = channel + data[i].size;
				// console.log(channel);

			}

			// determine average delays per edge in the network at this point in time
			for (var e in edges) {
				edges[ e ][ "delay" ] = edgeTable[ e ].average;
			}

			// determine average delay in the network at this point in time
			if (delay.length > 0) {
				var currentDelay = delay.runningAverage(average, count);
				average = currentDelay;
				count = count + 1;
			} else {
				var currentDelay = average;
			}

			// console.log(currentDelay);

			// collate information
			summary = { "flows": flows, "nodes": nodes,
						"edges": edges, "devices": devices,
						"delay": currentDelay, "channelUtilization": channel };

			// console.log("inserting data");

			// insert data into database
			database.insert( {time: summary}, {w:1}, function(err, docs) {
				if (err) { throw err; }

				// emit data via socketIO
				//io.sockets.in('clients').emit('1sec', { time: summary });

				// console.log("successful insert!");

				/*
				database.count(function(err, count) {
					if (err) { throw err; }
					console.log(format("count = %s", count));
				}); */

			});

			// var util = require('util');
			// console.log(util.inspect(summary, { showHidden: false, depth: null }));
			// console.log("******************************************************");

		}

		// }

	})
}
/*
Notes:
- It looks like the flowID is not unique enough for UDP (see port 61655).
How to handle this? If multiple flows go through the same node, how do you determine which
packet belongs to which flow? Are there multi-hop flows? Should all UDP packets be
considered a single flow (with only one part)?
- It looks like devices do switch IPs, even within the same second. How to track this?
- Aggregate data in 1-min and 1-hour pieces.
- Rearrange logic flow: wrap parser into one function.
*/