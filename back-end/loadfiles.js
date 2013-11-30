if(process.argv.length >= 5){
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
	else if(process.argv[3] == "geo")
		collection += "geo";
	else if(process.argv[3] == "ports")
		collection += "ports";
	else
		console.log("Unknown Collection");
		
	 loadFiles(server, collection, process.argv[4]);
}
else{
	console.log("Usage [local|amazon] [pcap|route|geo|ports] [path to json dir] ");
}

function loadFiles(server, collectionName, dir){
	console.log("Connecting to server at "+server+"/"+collectionName);
	var fs=require('fs');
	
	var num=0;
	var database;
	var fs = require('fs');
	var MongoClient = require('mongodb').MongoClient
		, format = require('util').format;    

	var fileList = [];
	var waitingForDB = false;
	var waitingForNext = false;
	MongoClient.connect(server, function(err, db) {
		if(err) throw err;
		
		database = db.collection(collectionName);
		if(collectionName == "geo"){
			database.ensureIndex( { ip: 1 }, { unique: true, dropDups: true  } , function(err, docs) {
				if (err) { throw err; }
			}); 
		}
		else if(collectionName == "ports"){
			database.ensureIndex( { port: 1 }, { unique: true, dropDups: true  } , function(err, docs) {
				if (err) { throw err; }
			}); 
		}
		else{
			database.ensureIndex( { time: 1 }, { unique: true, dropDups: true  } , function(err, docs) {
				if (err) { throw err; }
			});
		}
		
		fs.readdir(dir,function(err,files){
			if (err) throw err;
			files.forEach(function(file){
				if(file == "desktop.ini") return;
				fileList.push(file);		
			});
			
			simulation = setInterval(function(){
				if(waitingForNext){
					console.log("Waiting For Process");
					return;
				}
				if(num >= fileList.length){
					clearInterval(simulation);
					return;
				}
				process(num);
				num++;
				
			},5000);
		});
		
		
	 });  
		
		
	function process(){
		waitingForNext = true;
		console.log("["+num+"] Reading '"+dir+fileList[num]+"'");
		
		var json=require(dir+fileList[num]);
		var data = [];
		
		var currentElement =0;
		for(j in json){
			var entry = json[j];
			if(collectionName != "port"){
				entry = {
					'port': parseInt(j),
					'apps': json[j]
				};
			}
			else if(collectionName != "geo")
				entry.time = parseInt(entry.time);
			data.push(entry);

		}
		
		console.log("Inserting into DB");
		simulation = setInterval(function(){
			if(waitingForDB){
				//console.log("Waiting For Insert");
				return;
			}
			if(currentElement >= data.length){
				waitingForNext = false;
				clearInterval(simulation);
				return;
			}
			insert(data[currentElement]);
			currentElement++;
			
		},25);
		
	}

	function insert(data){
		waitingForDB = true;

		//console.log("Inserting into Database");
		database.insert( data, {w:1}, function(err, docs) {
			waitingForDB = false;
			/*
			if (err)  console.log("fail"); 
			else 	  console.log("successful insert!");		
			*/
		});
		
	}

}