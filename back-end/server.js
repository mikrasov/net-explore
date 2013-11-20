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

    // find min time
    collection.find({},{time:1}).sort({time: 1}).limit(1).toArray(function(err, resultMin) {

		var from = resultMin[0].time;
		// find max time
		collection.find({},{time:1}).sort({time: -1}).limit(1).toArray(function(err, resultMax) {
			var to = resultMax[0].time;
			
			console.log("History ["+from + ','+to+"]");
			socket.emit('history', {'from':from, 'to':to});
		});   
    });      
}
	
function findTimeSlice(db, socket, from, to){
	var collection = db.collection('time_slices');

	collection.find({time: { '$gte' : from, '$lte' : to }}).toArray(function(err, results) {
       socket.emit('1sec', {'from':from, 'to':to, 'data':results});
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