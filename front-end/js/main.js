var layoutType;
var showingAdvanced = false;
var pageLoaded = false;
var playSpeed = 1000;
var skipNoData = false;
var waitForData = false;

var data = new DataBuffer();

function applicationLoaded(){
d3.select("#loader").style("display", "none");
d3.select("#selector").style("display", "block");
	}
function setSkipNoData( skip){
	skipNoData = skip;
}
function updatePage(){
	if(!pageLoaded){
		d3.select("#loader").style("display", "none");
		d3.select("#app").style("display", "block");

		window.onresize = function(){
			var timeSliderValue = timeSlider.value();
			drawSlider(timeSliderValue);
		}

		//monitor changes in slider
		setInterval(function(){
			if(!sliderWasUpdated) return;
			
			data.get(currentTime);

			sliderWasUpdated = false;
		},1000);	
	
		itIsNow(minTime);
		updateTimeOffset();
		selectLayout("force");
		//selectLayout("map");
	
		pageLoaded = true;
	}
	
	drawSlider(currentTime);
	
	timeSliderHandle.classed("no-data", data.loaded(currentTime) && !data.hasData(currentTime) );	
}

function togglePlay(){
	controls.classed("playing",simulation == null);
	if(simulation == null){
		TESTER.startTest();
		simulation = setInterval(dataTick,playSpeed);
	}
	else{
		TESTER.stopTest();
		clearInterval(simulation);
		simulation = null;
	}
}

function dataTick(){
	while(skipNoData && data.loaded(currentTime) && !data.hasData(currentTime)){
		timeSliderHandle.classed("no-data", false );
		itIsNow(currentTime + timeStep);
		waitForData = false;
	}

	if(waitForData){
		if(data.loaded(currentTime)){
			timeSliderHandle.classed("load-data", false );
			itIsNow(currentTime + timeStep);
			timeSliderHandle.classed("no-data", !data.hasData(currentTime) );
			waitForData = false;
			TESTER.stopWaiting();
		}else{
			console.log("waiting");
			TESTER.startWaiting();
		}
	}			
	if(!waitForData && currentTime <= maxTime ){
		data.get(currentTime);
		timeSliderHandle.classed("load-data", !data.loaded(currentTime) );
		waitForData = true;
	}
}

function updatePlaySpeed(){
	var control =  d3.select("#play-speed").node();
	playSpeed = control.options[control.selectedIndex].value;
	
	if(simulation != null){
		togglePlay();
		togglePlay();
	}
}

function updateLayout(){
	if(layoutType == "map")
		updateMap();

	else if(layoutType == "force")
		updateGraph();
}

function selectLayout(type){
	if(type == undefined){
		var control = d3.select("#layout-control").node();
		type = control.options[control.selectedIndex].value;
	}
	
	layoutType = type;
	
	if(type == "map")
		createMap('#network-layout');
		
	else if(type == "force"){
		createGraph('#network-layout')
		updateGraph();
	}
}

function toggleAdvanced(){
	showingAdvanced = !showingAdvanced;
	d3.select("#advanced-controls").classed("show", showingAdvanced);
	d3.select("#toggle-advanced").classed("show", showingAdvanced);
}

