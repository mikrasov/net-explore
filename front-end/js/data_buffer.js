var minTime = 0, maxTime = 0;
var timeStep = 1;
var currentTime = 0;

function DataBuffer() {
	this.bufferSize = 50;
	this.buffer = [];
	this.length = 0;
	this.preLoadSent = false;
	this.autoLoad = true;
}

DataBuffer.prototype.setServer = function(server){
	d3.select("#selector").style("display", "none");
	d3.select("#loader").style("display", "block");
	
	this.socket = io.connect(server);
  
	this.socket.on('history', function (response) {
		minTime = parseInt(response.from);
		maxTime = parseInt(response.to);
		//console.log(response);
		updatePage();	
		
	}.bind(this));
	
	this.socket.on('1sec', function (response) {
		var results = response.data;
		
		console.log(response);
		for (var time=parseInt(response.from);time<=parseInt(response.to);time+=timeStep){
			this.buffer["_"+time] = null;
		}
		
		for(key in results){
			var r = results[key];
			r.time = parseInt(r.time);
			this.buffer["_"+r.time] = r;
			this.length++;

			if(r.time < minTime) minTime = r.time;
			if(r.time > maxTime) maxTime = r.time;
			
			//process data if it is current point
			if(r.time == currentTime){
				proccessData(r);					
			}	
		}
		
		if(response.preload == true)
			this.preLoadSent = false;
			
		updatePage();
		TESTER.dataLoaded = true;
	}.bind(this));
	
	
}

DataBuffer.prototype.hasData = function(time){
	return this.buffer["_"+time] != null;
}

DataBuffer.prototype.loaded = function(time){
	return typeof this.buffer["_"+time] != "undefined";
}


DataBuffer.prototype.nextValidTime = function(time){
	var cTime = time;
	return cTime;
}

DataBuffer.prototype.log = function(item){
	this.socket.emit('log', item);
}

DataBuffer.prototype.get = function(time){

	function get(type, from, to){
		console.log('Request {'+type+'} ['+from+','+to+']');	
		socket.emit('get', { "from": from, "to": to, 'preload': true });
	}
	
	//console.log('Getting data at '+time+' hasData: '+this.hasData(time)+' dataLoaded:'+this.loaded(time));
	/*
	if(playSpeed<1000){
		
		this.bufferSize = 50 + (10*Math.ceil(1000/playSpeed));
		//console.log(this.bufferSize);
	}
	*/

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
	if( this.autoLoad && !this.preLoadSent && !this.loaded(limit)){
		get("BUFFER", limit,  limit + buffer);
		this.preLoadSent = true;
	}		
	
};