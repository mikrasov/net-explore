var history = [];

var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;    

MongoClient.connect('mongodb://54.243.234.208/test', function(err, db) {
    if(err) throw err;

	var io = require('socket.io').listen(8080);
	  
	io.sockets.on('connection', function (socket) {
	  socket.join('clients');
	  updateStats(db,socket);
	  socket.on('put', function (request) {
		console.log("Loading file");
		// call parse(db, socket, request.file)
	  });
	  socket.on('get', function (request) {
		console.log("Data Requested");
		console.log(request.from + " - " + request.to);
		findTimeSlice(db, socket, request.from, request.to);
	  });
	});	  
});
	

function updateStats(db, socket){
	var collection = db.collection('time_slices');

    // Locate all the entries using find
    collection.find({},{time:1}).sort({time: 1}).toArray(function(err, results) {
		history = [];
		for(r in results)
			history.push(results[r].time);
		
		console.log(history);
		socket.emit('history', history);
    });      
}
	
function findTimeSlice(db, socket, from, to){
	var collection = db.collection('time_slices');

	collection.find({time: { '$gt' : from, '$lt' : to }}).toArray(function(err, results) {
       socket.emit('1sec', results);
    });  
}

/*
setInterval(function() { 
    io.sockets.in('clients').emit("1sec", { time: new Date().toString() })
}, 5000); 
*/

/*

  Event types
  
  Admin
	put	{file}
  
  Streaming
	1sec		[DATA, DATA, DATA]
	10sec
 
  Connection
	history		{from, to}

  Clients
	get
	
	
 */