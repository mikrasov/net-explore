
if(process.argv.length >= 4){
	var server = "mongodb://";
	var collection = "";
	
	if(process.argv[2] == "local")
		server += "localhost/"; 
	else if(process.argv[2] == "amazon")
		server += "54.243.234.208/";
	else
		console.log("Unknown Server");
		
	//DB Name
	server += "test"
	
	if(process.argv[3] == "pcap")
		collection += "time_slices";
	else if(process.argv[3] == "route")
		collection += "internet_traces";
	else
		console.log("Unknown Collection");
		
	 serveClient(server, collection);
}
else{
	console.log("Usage [local|amazon] [pcap|route] ");
}

function serveClient(server, collectionName){
	console.log("Starting server at "+server+"/"+collectionName);

	var history = [];

	var MongoClient = require('mongodb').MongoClient
		, format = require('util').format;    
	var collection;
		
	var ip = server;
	MongoClient.connect(ip, function(err, db) {
		if(err) throw err;

		//collection = db.collection('time_slices');
		collection = db.collection(collectionName);
		
		var io = require('socket.io').listen(8080);
		  
		io.sockets.on('connection', function (socket) {
		  socket.join('clients');
		  updateStats(db,socket);
		  socket.on('put', function (request) {
			console.log("Loading file");
			// call parse(db, io, request.file)
		  });
		  socket.on('get', function (request) {
			console.log("Data Requested");
			console.log(request.from + " - " + request.to);
			findTimeSlice(db, socket, request.from, request.to);
		  });
		});	  
	});
		

	function updateStats(db, socket){
		 
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
		collection.find({time: { '$gte' : from, '$lte' : to }}).toArray(function(err, results) {
		   socket.emit('1sec', {'from':from, 'to':to, 'data':results});
		});  
	}

}

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