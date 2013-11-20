
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
			
			maxTime= parseInt(entry.time);
			
			this.buffer["_"+entry.time] = entry;
		}
		
		//Set all other times to loaded but nodata
		for (var time=minTime;time<=maxTime;time+=timeStep){
			if( typeof this.buffer["_"+time] == "undefined")
				this.buffer["_"+time] = null;
		}
		
	}
	else{
		
		this.socket = io.connect('http://localhost:8080');
		
		this.socket.on('history', function (response) {
			
			minTime = response.from;
			maxTime = response.to;
			
			console.log(response);
		
			updatePage();	
		}.bind(this));
		
		this.socket.on('1sec', function (response) {
			
			var results = response.data;
			
			for (var time=response.from;time<=response.to;time+=timeStep){
				this.buffer["_"+time] = null;
			}
			
			console.log(response);
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

DataBuffer.prototype.hasData = function(time){
	return this.buffer["_"+time] != null;
}

DataBuffer.prototype.loaded = function(time){
	return typeof this.buffer["_"+time] != "undefined";
}


DataBuffer.prototype.nextValidTime = function(time){
	var cTime = time;
	while(cTime < maxTime && !this.hasData(cTime) ){
		cTime += timeStep;
	}
	
	return cTime;
}


DataBuffer.prototype.get = function(time){

	function get(type, from, to){
		console.log('Request {'+type+'} ['+from+','+to+']');
		socket.emit('get', { "from": from, "to": to });
	}
	
	console.log('Getting data at '+time+' hasData: '+this.hasData(time)+' dataLoaded:'+this.loaded(time));

	if(playSpeed<1000){
		this.bufferSize = 50 + (10*Math.ceil(1000/playSpeed));
		//console.log(this.bufferSize);
	}	

	
	if(typeof io == "undefined"){
		if( !this.hasData(time)) return;
		
		proccessData( this.buffer["_"+time]);
	}
	else {
		var buffer   = (timeStep * this.bufferSize);
		var limit = this.nextValidTime(time + (timeStep * Math.ceil((this.bufferSize/10) )));
		var socket = this.socket;
	

		if( this.hasData(time) ){
			proccessData( this.buffer["_"+time]);
		}
		else if(!this.loaded(time)){
			get("NOW", time, time);
			get("NEXT", time+timeStep, time+buffer);
		}
		
		
		//Buffer next data
		if( !this.preLoadSent && !this.loaded(limit)){

			get("BUFFER", limit,  limit + buffer);
			this.preLoadSent = true;
		}
		
		
	}
};