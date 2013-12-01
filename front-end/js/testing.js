var TESTER = new TestingSuite("generic");

function TestingSuite(testName) {
	this.results = {
		'test': 		testName,
		'testDate': 	Date.now(),
		'timeWaiting': 	0,
		'timeTest':		0
	}
	this.startWaitTime = 0;
	this.startTestTime = 0;
	this.numSlices = 0;
}

TestingSuite.prototype.sliceLoaded = function(){
	this.numSlices++;
}
TestingSuite.prototype.startWaiting = function(){
	//console.log("start waiting");
	this.startTestTime = Date.now();
}
TestingSuite.prototype.stopWaiting = function(){
	
	if(this.startWaitTime > 0){
		//console.log("stop waiting");
		this.results.timeWaiting += (Date.now() - this.startWaitTime);
	}
	this.startWaitTime =0;
}
TestingSuite.prototype.startTest = function(){
	//console.log("start test");
	this.startTestTime =  Date.now();
}
TestingSuite.prototype.stopTest = function(){
	//console.log("stop test");
	this.results.timeTest += (Date.now() - this.startTestTime);
	this.log();
}

TestingSuite.prototype.log = function(){
	console.log('sending log');
	this.results.browser = this.getBrowser();
	this.results.metrics = {
		'flows':	graph.flow.count,
		'nodes':	graph.node.count,
		'edges':	graph.edge.count,
		'devices':	graph.device.count,
		'slices':	this.numSlices
	}
	data.log(this.results);
}

TestingSuite.prototype.getBrowser = function(){
	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browserName  = navigator.appName;
	var fullVersion  = ''+parseFloat(navigator.appVersion); 
	var majorVersion = parseInt(navigator.appVersion,10);
	var nameOffset,verOffset,ix;

	// In Opera, the true version is after "Opera" or after "Version"
	if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
	 browserName = "Opera";
	 fullVersion = nAgt.substring(verOffset+6);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
	 browserName = "Microsoft Internet Explorer";
	 fullVersion = nAgt.substring(verOffset+5);
	}
	// In Chrome, the true version is after "Chrome" 
	else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
	 browserName = "Chrome";
	 fullVersion = nAgt.substring(verOffset+7);
	}
	// In Safari, the true version is after "Safari" or after "Version" 
	else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
	 browserName = "Safari";
	 fullVersion = nAgt.substring(verOffset+7);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In Firefox, the true version is after "Firefox" 
	else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
	 browserName = "Firefox";
	 fullVersion = nAgt.substring(verOffset+8);
	}
	// In most other browsers, "name/version" is at the end of userAgent 
	else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
			  (verOffset=nAgt.lastIndexOf('/')) ) 
	{
	 browserName = nAgt.substring(nameOffset,verOffset);
	 fullVersion = nAgt.substring(verOffset+1);
	 if (browserName.toLowerCase()==browserName.toUpperCase()) {
	  browserName = navigator.appName;
	 }
	}
	// trim the fullVersion string at semicolon/space if present
	if ((ix=fullVersion.indexOf(";"))!=-1)
	   fullVersion=fullVersion.substring(0,ix);
	if ((ix=fullVersion.indexOf(" "))!=-1)
	   fullVersion=fullVersion.substring(0,ix);

	majorVersion = parseInt(''+fullVersion,10);
	if (isNaN(majorVersion)) {
	 fullVersion  = ''+parseFloat(navigator.appVersion); 
	 majorVersion = parseInt(navigator.appVersion,10);
	}

	return {
		'name':			browserName,
		'fullVersion':	fullVersion,
		'majorVersion':	majorVersion,
		'appName':		navigator.appName,
		'userAgent':	navigator.userAgent

	}


}