
var minTime = 0, maxTime = 0;
var timeStep = 1;
var currentTime = 0;

function DataBuffer() {

	this.bufferSize = 50;
	this.buffer = [];
	this.preLoadSent = false;

	
	if(typeof io == "undefined"){
		console.log("Defaulting to load from local file");
		
		//LoadData from sample data
		for (var key in sample_data) {	
			var entry = sample_data[key];
			if(minTime == 0) 
				minTime = parseInt(entry.time);
			maxTime = parseInt(entry.time);
			
			this.buffer["_"+entry.time] = entry;
		}
		
		console.log(this.buffer);
		
	}
	else{
		
		this.socket = io.connect('http://localhost:8080');
		
		this.socket.on('history', function (results) {
			for(r in results){
				var time = results[r];
				this.buffer["_"+time] = null;
			}
			
			minTime = results[0];
			maxTime = results[results.length-1];
			
			updatePage();	
		}.bind(this));
		
		this.socket.on('1sec', function (results) {
			
			//console.log(results);
			for(key in results){

				var r = results[key];
				this.buffer["_"+r.time] = r;

				if(r.time < minTime) minTime = r.time;
				if(r.time > maxTime) maxTime = r.time;
				
				//process data if it is current point
				if(r.time == currentTime){
					proccessData(r);					
				}
				
				this.preLoadSent = false;
			}
			
			
			updatePage();
			
			
		}.bind(this));
	}
}

DataBuffer.prototype.exists = function(time){
	return typeof this.buffer["_"+time] != "undefined";
}

DataBuffer.prototype.loaded = function(time){
	return this.buffer["_"+time] != null;
}


DataBuffer.prototype.nextValidTime = function(time){
	var cTime = time;
	while(cTime < maxTime && !this.exists(cTime) ){
		cTime += timeStep;
	}
	
	return cTime;
}


DataBuffer.prototype.get = function(time){

	function get(type, from, to){
		console.log('Request ['+type+'] ('+from+','+to+')');
		socket.emit('get', { "from": from, "to": to });
	}
	
	//console.log('Getting data at '+time+' exists: '+this.exists(time));
	
	
	if(playSpeed<1000){
		this.bufferSize = 50 + (10*Math.ceil(1000/playSpeed));
		//console.log(this.bufferSize);
	}	

	
	if(typeof io == "undefined"){
		if( !this.exists(time)) return;
		
		proccessData( this.buffer["_"+time]);
	}
	else {
		var offset = (timeStep * 1);
		var buffer   = (timeStep * this.bufferSize);
		var limit = this.nextValidTime(time + (timeStep * Math.ceil((this.bufferSize/10) )));
		var socket = this.socket;
	
		if( this.exists(time)){
			if( this.loaded(time) ){
				proccessData( this.buffer["_"+time]);
			}
			else{
				get("NOW", time-offset, time+offset);
				get("NEXT", time+offset, time+buffer);
			}
		}
		
		if( !this.preLoadSent && !this.loaded(limit)){

			get("BUFFER", limit-offset,  limit + buffer);
			this.preLoadSent = true;
		}
		
		
	}
};