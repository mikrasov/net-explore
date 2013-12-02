var TEST_ID = 0;
var TEST = [
		new TestingSuite(),
		new TestingSuite("map",   "pcap",	1,  1328373494, 3600, 1, true),
		new TestingSuite("map",   "pcap",	15, 1328373494, 3600, 1, true),
		new TestingSuite("map",   "pcap",	60, 1328373494, 3600, 1, true),
		new TestingSuite("map",   "routes", 1,  1384674067, 3600, 1, true),
		new TestingSuite("map",   "routes", 15, 1384674067, 3600, 1, true),
		new TestingSuite("map",   "routes", 60, 1384674067, 3600, 1, true),
		new TestingSuite("force", "pcap",	1,  1328373494, 3600, 1, true),
		new TestingSuite("force", "pcap",	15, 1328373494, 3600, 1, true),
		new TestingSuite("force", "pcap",	60, 1328373494, 3600, 1, true),
		new TestingSuite("force", "routes", 1,  1384674067, 3600, 1, true),
		new TestingSuite("force", "routes", 15, 1384674067, 3600, 1, true),
		new TestingSuite("force", "routes", 60, 1384674067, 3600, 1, true),
		
		new TestingSuite("map",   "pcap",	1,  1328373494, 3600, 1000, false),
		new TestingSuite("map",   "routes", 1,  1384674067, 3600, 1000, false),
		new TestingSuite("force", "pcap",	1,  1328373494, 3600, 1000, false),
		new TestingSuite("force", "routes", 1,  1384674067, 3600, 1000, false),
		
		new TestingSuite("map",   "pcap",	1,  1328373494, 3600, 250, false),
		new TestingSuite("map",   "routes", 1,  1384674067, 3600, 250, false),
		new TestingSuite("force", "pcap",	1,  1328373494, 3600, 250, false),
		new TestingSuite("force", "routes", 1,  1384674067, 3600, 250, false),
	];

var testNumber = parseInt(getURLParameter("test") == null? 0 : getURLParameter("test"));
var TESTER = TEST[testNumber];

var autoAdvance = (getURLParameter("auto") != null && testNumber+1<TEST.length);


function TestingSuite(layout, source, removeAfter, fromTime, duration, testSpeed, preLoad) {
	this.dummy = typeof layout == "undefined";

	this.id 			= TEST_ID++;
	this.device			= getURLParameter("device");
	this.layout 		= layout;
	this.removeAfter 	= removeAfter,
	this.source 		= source;
	this.fromTime 		= fromTime;
	this.duration 		= duration;
	this.testSpeed 		= testSpeed;
	
	this.testDate 		= Date.now();
	this.timeWaiting 	= 0;
	this.timeTest 		= 0;
	this.preLoad		= preLoad;
	this.toTime 		= fromTime+duration;
	
	this.startWaitTime 	= 0;
	this.startTestTime 	= 0;
	this.dataLoaded 	= false;
	this.testStarted 	= false;
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

TestingSuite.prototype.setupTest = function(){
	if(this.dummy) return;

	console.log("TEST SELECTED");
	console.log(this);
	
	layoutType = this.layout;
	data.setServer("/"+this.source);
	data.autoLoad = !this.preLoad;
}

TestingSuite.prototype.startTest = function(){
	if(this.dummy) return;
	console.log("Start Test");
	itIsNow(this.fromTime);
	
	if(this.preLoad){
		setSkipNoData(true);
		data.socket.emit('get', { "from": this.fromTime, "to": this.toTime });
	}
	var simulation = setInterval(function(){
		if(TESTER.preLoad	 && !TESTER.dataLoaded) return;
		if(currentTime > TESTER.toTime){
			clearInterval(simulation);
			console.log("test completed");
			TESTER.timeTest += (Date.now() - TESTER.startTestTime);
			TESTER.log();
			if(autoAdvance) 
				window.location.href = "index.html?auto=true&device"+TESTER.device+"&test="+(testNumber+1);
			return;
		}
		
		if(!this.testStarted){
			TESTER.testStarted = true;
			TESTER.startTestTime =  Date.now();
		}
		dataTick();
		
	},this.testSpeed );
}

TestingSuite.prototype.startWaiting = function(){
	console.log("start waiting");
	this.dataLoaded = true;
	this.startTestTime = Date.now();
}

TestingSuite.prototype.stopWaiting = function(){	
	if(this.startWaitTime > 0){
		console.log("stop waiting");
		this.timeWaiting += (Date.now() - this.startWaitTime);
	}
	this.startWaitTime =0;
}

TestingSuite.prototype.log = function(){
	console.log('sending log');
	this.browser = this.getBrowser();
	this.metrics = {
		'flows':	graph.flow.count,
		'nodes':	graph.node.count,
		'edges':	graph.edge.count,
		'devices':	graph.device.count,
		'num_slices':	graph.numSlices,
		'buffer_length':	data.length
	}
	console.log(TESTER);
	data.log(TESTER);
}

TestingSuite.prototype.getBrowser = function(){
	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browserName  = navigator.appName;
	var fullVersion  = ''+parseFloat(navigator.appVersion); 
	var majorVersion = parseInt(navigator.appVersion,10);
	var nameOffset,verOffset,ix;

	// screen
	var screenSize = '';
	if (screen.width) {
		width = (screen.width) ? screen.width : '';
		height = (screen.height) ? screen.height : '';
		screenSize += '' + width + " x " + height;
	}
	
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

	var os = "unknown";
	var clientStrings = [
		{s:'Windows 3.11', r:/Win16/},
		{s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
		{s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
		{s:'Windows 98', r:/(Windows 98|Win98)/},
		{s:'Windows CE', r:/Windows CE/},
		{s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
		{s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
		{s:'Windows Server 2003', r:/Windows NT 5.2/},
		{s:'Windows Vista', r:/Windows NT 6.0/},
		{s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
		{s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
		{s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
		{s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
		{s:'Windows ME', r:/Windows ME/},
		{s:'Android', r:/Android/},
		{s:'Open BSD', r:/OpenBSD/},
		{s:'Sun OS', r:/SunOS/},
		{s:'Linux', r:/(Linux|X11)/},
		{s:'iOS', r:/(iPhone|iPad|iPod)/},
		{s:'Mac OS X', r:/Mac OS X/},
		{s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
		{s:'QNX', r:/QNX/},
		{s:'UNIX', r:/UNIX/},
		{s:'BeOS', r:/BeOS/},
		{s:'OS/2', r:/OS\/2/},
		{s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
	];
	for (var id in clientStrings) {
		var cs = clientStrings[id];
		if (cs.r.test(nAgt)) {
			os = cs.s;
			break;
		}
	}

	var osVersion = "unknown";

	if (/Windows/.test(os)) {
		osVersion = /Windows (.*)/.exec(os)[1];
		os = 'Windows';
	}

	switch (os) {
		case 'Mac OS X':
			osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
			break;

		case 'Android':
			osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
			break;

		case 'iOS':
			osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
			osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
			break;
	}

	return {
		'screen':		screenSize,
		'name':			browserName,
		'fullVersion':	fullVersion,
		'majorVersion':	majorVersion,
		'appName':		navigator.appName,
		'userAgent':	navigator.userAgent,
		'os':			os,
		'osVersion':	osVersion
	}
}