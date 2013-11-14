
var layoutType;

itIsNow(1328369164);
updateTimeOffset();
selectLayout("force");
drawSlider(0);

window.onresize = function(){
	var timeSliderValue = timeSlider.value();
	drawSlider(timeSliderValue);
		
}


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

