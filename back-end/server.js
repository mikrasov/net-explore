serveClient("mongodb://localhost/netX_DB");

function serveClient(server){

	var app = require('http').createServer(handler)
	  , mime = require('mime')
	  , io = require('socket.io').listen(app)
	  , path = require("path")  
	  , url = require("url")
	  , fs = require('fs')
	  , MongoClient = require('mongodb').MongoClient
	  , format = require('util').format
	var geo ={}, ports={};

	function handler (request, response) {
	    var my_path = "client"+url.parse(request.url).pathname;  
		if(my_path == "client/") my_path = "client/index.html";

		var full_path = path.join(process.cwd(),my_path);  
		fs.exists(full_path,function(exists){  
			if(!exists){  
				response.writeHeader(404, {"Content-Type": "text/plain"});    
				response.write("404 Not Found\n");    
				response.end();  
			}  
			else{  
				fs.readFile(full_path, "binary", function(err, file) {    
					 if(err) {    
						 response.writeHeader(500, {"Content-Type": "text/plain"});    
						 response.write(err + "\n");    
						 response.end();    					 
					 }    
					 else{  
						response.writeHeader(200, {"Content-Type":  mime.lookup(full_path) } );    
						response.write(file, "binary");    
						response.end();  
					}  						   
				});  
			}  
		});
	}

	console.log("Starting server at "+server);
	MongoClient.connect(server, function(err, db) {
		if(err) throw err;

		console.log("Connected to DB");
		
		loadCache(db);
		app.listen(8080);
		 
		io.set('log level', 1)
		io.of('/pcap').on('connection', function (socket) {
		  onConnect( db.collection("time_slices"), socket)
		});
		io.of('/routes').on('connection', function (socket) {
		  onConnect( db.collection("internet_traces"), socket)
		});
		io.of('/admin').on('connection', function (socket) {
		  socket.join('admin');
		  socket.on('put', function (request) {
			console.log("Loading file");
			// call parse(db, io, request.file)
		  });
		});
		
		console.log("Server Started");
	});

	function onConnect(collection, socket){
		socket.join('client');
		console.log("Conection established");
		updateStats(collection,socket);
		socket.on('get', function (request) {
			console.log("Data Requested");
			console.log(request.from + " - " + request.to);
			findTimeSlice(collection, socket, request.from, request.to, request.preload);
		});
		socket.on('log', saveLog);
	}
	
	function updateStats(collection, socket){	 
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
		
	function findTimeSlice(collection, socket, from, to, preload ){
		collection.find({time: { '$gte' : from, '$lte' : to }}).toArray(function(err, results) {
			for(s in results){
				var slice = results[s];
				
				for(n in slice.nodes){
					var node = slice.nodes[n];
				
					if(typeof geo[node.ip] != "undefined")	
						node.geo = geo[node.ip];
				}
			}
			socket.emit('1sec', {'from':from, 'to':to, 'data':results, 'preload': preload});
		});  
	}
	
	function loadCache(db){
		console.log("loading cache");
		db.collection('geo').find().toArray(function(err, results) {
			if(err)throw err;
			
			for(r in  results){
				var entry = results[r];
				geo[entry.ip] = entry;
				
			}
			console.log("GPS Cache Loaded");
		});  
	}
	
	function saveLog(request){	
		console.log("Log Saved");
		console.log(request);

		var msg = "";
		msg += sortObjectByKey(request);
		msg += "\n";	
		
		fs.appendFile('./log.csv', msg, function (err) {});
	}
}

function sortObjectByKey(obj){
    var keys = [];
    var sorted_obj = {};
	var msg = "";

    for(var key in obj){
        if(key == "browser" || key == "metrics"){
			msg += sortObjectByKey(obj[key]);
		}
		else if(obj.hasOwnProperty(key)){
            keys.push(key);
        }
    }

    // sort keys
    keys.sort();

    for (i = 0; i < keys.length; i++){
		msg += (new String(obj[keys[i]])).replace(",",".").replace('"','') + ",";
	}

    return msg;
};

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