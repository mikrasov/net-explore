
var currentTime;
var timeOffset;
var timeStep = 1;


function humanTime(currentTime){
	var time = moment.unix(currentTime);
	time.zone(timeOffset);
	return time.format("MMM DD YYYY - hh:mm:ss"); 
}

var simulation = null;
var controls = d3.select("#controls");
var playSpeed = 1000;

function updatePlaySpeed(){
	var control =  d3.select("#play-speed").node();
	console.log(control);
	playSpeed = control.options[control.selectedIndex].value;
	
	if(simulation != null){
		togglePlay();
		togglePlay();
	}
}

function togglePlay(){
	
	controls.classed("playing",simulation == null);
	if(simulation == null){
		simulation = setInterval(function(){

			if(currentTime >= 1328372758 ){
				clearInterval(simulation);
			}
			
			
			itIsNow(currentTime + timeStep);
			proccessData(data[currentTime], currentTime);
			updateLayout();


		},playSpeed);
	}
	else{
		clearInterval(simulation);
		simulation = null;
	}
}

var minTime, maxTime;
for (var key in data) {	
	if(minTime == undefined) minTime = key;
	maxTime = key;
}

var timeSlider;
var timeSliderElement = d3.select("#slider");

function drawSlider(timeSliderValue){
console.log(timeSliderValue);
	timeSlider =  d3.slider()
					.axis(false)
					.min(minTime)
					.max(maxTime)
					.step(timeStep)
					.value(timeSliderValue)
					.on("slide", function(evt, value) {
						currentTime = value;
						d3.select("#slider-time-now").html(humanTime(value));
					})
	timeSliderElement.selectAll("svg").remove();
	timeSliderElement.selectAll("a").remove();
	timeSliderElement.call(timeSlider);
}

function updateTimeOffset(){
	var control = d3.select("#time-offset").node();
	timeOffset = control.options[control.selectedIndex].value;
	d3.select("#slider-time-start").html(humanTime(minTime));
	d3.select("#slider-time-end").html(humanTime(maxTime));
	updateSidebar();
}

function itIsNow(time){
	currentTime = time;
	drawSlider(currentTime);
	d3.select("#slider-time-now").html(humanTime(currentTime));
}
