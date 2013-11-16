
var layoutType;
var showingAdvanced = false;



itIsNow(minTime);
updateTimeOffset();
selectLayout("force");
drawSlider(currentTime);

window.onresize = function(){
	var timeSliderValue = timeSlider.value();
	drawSlider(timeSliderValue);
		
}

//monitor changes in slider
setInterval(function(){
	if(!sliderWasUpdated) return;
	
	proccessData(data[currentTime], currentTime);

	sliderWasUpdated = false;
},1000);


function updateLayout(){
	if(layoutType == "map")
		updateMap(graph);

	else if(layoutType == "force")
		updateGraph();
}

function selectLayout(type){
	if(type == undefined){
		var control = d3.select("#layout-control").node();
		type = control.options[control.selectedIndex].value;
	}
	
	if(type == "map")
		createMap('#network-layout');
		
	else if(type == "force")
		createGraph('#network-layout')

	layoutType = type;
	updateLayout();
}

function toggleAdvanced(){
	showingAdvanced = !showingAdvanced;
	d3.select("#advanced-controls").classed("show", showingAdvanced);
	d3.select("#toggle-advanced").classed("show", showingAdvanced);
}

