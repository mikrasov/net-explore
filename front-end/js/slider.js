var timeSlider;
var timeSliderElement = d3.select("#slider");
var timeSliderHandle

var sliderWasUpdated = false;
var timeOffset;

var simulation = null;
var controls = d3.select("#controls");

function humanTime(currentTime){
	var time = moment.unix(currentTime);
	time.zone(timeOffset);
	return time.format("MMM DD YYYY - hh:mm:ss"); 
}

function drawSlider(timeSliderValue){
	timeSlider =  d3.slider()
					.axis(false)
					.min(minTime)
					.max(maxTime)
					.step(timeStep)
					.value(timeSliderValue)
					.on("slide", function(evt, value) {
						currentTime = value;
						sliderWasUpdated = true;
						d3.select("#slider-time-now").html(humanTime(value));
						
					})
	timeSliderElement.selectAll("svg").remove();
	timeSliderElement.selectAll("a").remove();
	timeSliderElement.call(timeSlider);
	timeSliderHandle = d3.select(".d3-slider-handle");
}

function updateTimeOffset(){
	var control = d3.select("#time-offset").node();
	timeOffset = control.options[control.selectedIndex].value;
	d3.select("#slider-time-start").html(humanTime(minTime));
	d3.select("#slider-time-now").html(humanTime(currentTime));
	d3.select("#slider-time-end").html(humanTime(maxTime));
	updateSidebar();
}

function itIsNow(time){
	currentTime = time;
	drawSlider(currentTime);
	d3.select("#slider-time-now").html(humanTime(currentTime));
}