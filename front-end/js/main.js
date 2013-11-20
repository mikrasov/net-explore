var layoutType;
var showingAdvanced = false;
var pageLoaded = false;
var playSpeed = 1000;

var data = new DataBuffer();

if(typeof io == "undefined"){
	updatePage();
}

/*
var ips = [];
var cnt = 0;
d3.select("#app").html("");
for(d in sample_data){
	var nodes = sample_data[d].nodes;
	for(n in nodes){
		var node = nodes[n];
		if(node.network =="public" && typeof ips[node.ip] == "undefined"){
			ips[node.ip] = {};
			//d3.select("#app").append("span").html("'"+node.ip+"', ");
			cnt++;
		}
	}
}
console.log(cnt);

console.log(ips);
console.log(ips.length);
//d3.select("#app").html(out);
*/

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

	var waitForData = false;
	controls.classed("playing",simulation == null);
	if(simulation == null){
		simulation = setInterval(function(){
		
			
			if(waitForData){
				if(data.loaded(currentTime)){
					waitForData = false;
					timeSliderHandle.classed("load-data", false );
					itIsNow(currentTime + timeStep);
				}else{
					console.log("waiting");
				}
			}			
			if(!waitForData && currentTime <= maxTime ){
				data.get(currentTime);
				timeSliderHandle.classed("load-data", !data.loaded(currentTime) );
				waitForData = true;
			}
		},playSpeed);
	}
	else{
		clearInterval(simulation);
		simulation = null;
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
	console.log(layoutType);
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

