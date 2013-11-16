var data = new Array();
var minTime, maxTime;

if(typeof io == "undefined"){
	console.log("Defaulting to load from local file");
	//LoadData from sample data
	for (var key in sample_data) {	
		var entry = sample_data[key];
		if(minTime == undefined) minTime = parseInt(entry.time);
		data[entry.time] = entry;
		maxTime = parseInt(entry.time);
	}
}
else{


	var socket = io.connect('http://localhost:8080');
	  socket.on('1sec', function (data) {
		console.log(data);
	  });
	  socket.on('history', function (data) {
		minTime = parseInt(data.from);
		maxTime = parseInt(data.to);
	  });

	  
	  setInterval(function() { 
		socket.emit('load', { file: '/var/www/filename' });
		socket.emit('get', { from: '0', to: '50' });

	}, 5000); 



}