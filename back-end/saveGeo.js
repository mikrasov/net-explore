var fs = require('fs');
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;    

MongoClient.connect('mongodb://54.243.234.208/test', function(err, db) {
    if(err) throw err;

	db.collection('geo').find().toArray(function(err, results) {

		var output = {};
		
		for(r in results){
			var result = results[r];
			
			output[result.ip] = result;
		}
		
		var outputFilename = 'geo.json';

		fs.writeFile(outputFilename, JSON.stringify(output, null, 4), function(err) {
			if(err) {
			  console.log(err);
			} else {
			  console.log("JSON saved to "+outputFilename);
			}
		}); 
    });   
	

 });  
	


