var pcapp = require('pcap-parser');

var parser = pcapp.parse('../Data/eth1_eth2_20120204182604.pcap');
parser.on('packet', function(packet) {
  console.log(packet);
});