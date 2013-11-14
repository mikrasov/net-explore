/*
Parser
CS284 Project
Leah Chatkeonopadol
Michael Nekrasov
Fall 2013
*/

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
    for(var p in this)
        if(this[p] === k)
            return true;
    return false;
}

var pcap = require('pcap'),
    // tcp_tracker = new pcap.TCP_tracker(),
    pcap_session = pcap.createOfflineSession("./test.pcap","");

/* tcp_tracker.on('start', function (session) {
    console.log("Start of TCP session between " + session.src_name + " and " + session.dst_name);
});

tcp_tracker.on('end', function (session) {
    console.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
}); */

var data = 0;
var currentTime = 0;

pcap_session.on('packet', function (raw_packet) {

    var util = require('util');
    var fs = require('fs');
    var packet = pcap.decode.packet(raw_packet);

    // tcp_tracker.track_packet(packet);
    // console.log(util.inspect(packet, { showHidden: true, depth: null }));
    // console.log(packet.link.ethertype);

    // divide time into 1s pieces
    var time = packet.pcap_header.time_ms;
    time = Math.floor(time/1000);                   // should this be floor or round?

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
            JSONpacket[ "num" ] = packet.link.ip.tcp.seqno;
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
            JSONpacket[ "num" ] = 0;
        } else {
            JSONpacket[ "size" ] = packet.link.ip.header_bytes;
            JSONpacket[ "port" ] = 0;
            JSONpacket[ "num" ] = 0;
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

        // fs.writeFile('./test.txt', data, encoding='utf8');
        // console.log(data);

    }

});

function perSecond(time, data) {

    var i;
    var j;
    var nodes = {};
    var flows = {};
    var edges = {};
    var summary = {};
    var devices = {};

    for (i=0; i<data.length; i++) {

        // extract node and device information
        // use replace three times to exchange "-" for "." in nodeIDs
        // use replace five times to exchange "-" for ":" in deviceIDs
        var sourceNodeID = (data[i].sourceIP).replace(".","-");
        sourceNodeID = sourceNodeID.replace(".","-");
        sourceNodeID = sourceNodeID.replace(".","-");

        var nodeInfo = { "ip": data[i].sourceIP,
                         "bandwidthUtilization": data[i].size,
                         "network": "public",
                         "flows": [] };

        for (var ip=0; ip<4; ip++) {
            if (ipLabelTable[ip].re.test(data[i].sourceIP)) {
                nodeInfo[ "network" ] = ipLabelTable[ip].network;
            }
        }

        if (nodes[ sourceNodeID ] === undefined) {
            nodes[ sourceNodeID ] = nodeInfo;
        } else {
            nodes[ sourceNodeID ].bandwidthUtilization = nodes[ sourceNodeID ].bandwidthUtilization +
                                                       data[i].size;
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

        nodeInfo = { "ip": data[i].destIP,
                     "bandwidthUtilization": data[i].size,
                     "network": "public",
                     "flows": [] };

        for (var ip=0; ip<4; ip++) {
            if (ipLabelTable[ip].re.test(data[i].destIP)) {
                nodeInfo[ "network" ] = ipLabelTable[ip].network;
            }
        }

        if (nodes[ destNodeID ] === undefined) {
            nodes[ destNodeID ] = nodeInfo;
        } else {
            nodes[ destNodeID ].bandwidthUtilization = nodes[ destNodeID ].bandwidthUtilization +
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
                             "parts": [],
                             "num": data[i].num };
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

    }

    summary[ time ] = { "flows": flows, "nodes": nodes,
                        "edges": edges, "devices": devices };

    var util = require('util');

    /*
    MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
        if(err) throw err;

        var collection = db.collection('time_slices');
        collection.insert({ time: summary }, function(err, docs) {
            collection.count(function(err, count) {
            console.log(format("count = %s", count));
            });

            collection.find().toArray(function(err, results) {
                // console.dir(results);
                db.close();
            });
        });
    }) */

    // console.log(util.inspect(nodes, { showHidden: true, depth: null }));
    // console.log(util.inspect(edges, { showHidden: true, depth: null }));
    // console.log(util.inspect(flows, { showHidden: true, depth: null }));
    // console.log("******************************************************");
    // console.log("******************************************************");

    console.log(util.inspect(summary, { showHidden: false, depth: null }));
    console.log("******************************************************");
    // console.log("******************************************************");

}

/*
Notes:
- It looks like the flowID is not unique enough for UDP (see part 61655).
How to handle this? If multiple flows go through the same node, how do you determine which
packet belongs to which flow?
- Order parts within a flow? Note there are bi-directional links within the same flow.
- How to get the maximum observed capacity of an edge? Client-side processing?
- How to calculate delay info?
- It looks like devices do switch IPs, even within the same second. How to track this?
*/