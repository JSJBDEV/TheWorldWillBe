var markers = [];
var polygons = [];
var polylines = [];
var map = L.map('map', {
	minZoom: 2,
	maxZoom: 9,
	renderer: L.svg()  
});

var cartodbAttribution = '&copy; <a href="https://earthobservatory.nasa.gov/">NASA</a>';

var positron = L.tileLayer('http://s3.amazonaws.com/com.modestmaps.bluemarble/{z}-r{y}-c{x}.jpg', {
	attribution: cartodbAttribution
}).addTo(map);

var myIcon = L.icon({
	//#d=11&c1=7&c2=7&c3=7&o=11&c4=7&s=17&c5=7 (highest values)
	iconUrl: 'http://flag-designer.appspot.com/gwtflags/SvgFileService?d=0&c1=5&c2=3&c3=6&o=2&c4=5&s=13&c5=1',
	iconSize: [60,40],
	iconAnchor: [30, 20],
	popupAnchor: [0, -5],
	});
map.setView([0, 0], 0);

 L.marker([-10.4333333,105.6833333]).addTo(map)
.bindPopup('<a href="https://earthobservatory.nasa.gov/">NASA</a>');

var latlngs = [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]];
var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);

function addPolygon(latlngs,colour)
{
	var polygon = L.polygon(latlngs, {color: colour}).addTo(map);
	polygons.push(polygon);
	return polygon;
	
}
function addPolyline(latlngs,colour)
{
	var polyline = L.polyline(latlngs, {color: colour}).addTo(map);
	polylines.push(polyline)
	
}
function removePolyline(id)
{
	map.removeLayer(polylines[id]);
	polylines.splice(id);
}
function removePolygon(id)
{
	map.removeLayer(polygons[id]);
	polygons.splice(id);
}

function addMarker(lat,lon,desc)
{
	var marker = L.marker([lat,lon],{icon: myIcon}).addTo(map).bindPopup(desc);
	markers.push(marker);
	return markers;
}
function removeMarker(id)
{
	map.removeLayer(markers[id]);
	markers.splice(id);
}
//--------------------------------------non map things------------------------//
var ResDomain = "http://jsjbdev.github.io/twwb/"
var loadedRes = [];
var taskResponse = "";
var taskQueue = [];

function getFile(url) //using a simple fetch method I can grab my libraries.
{
fetch(ResDomain+url)
  .then(function(response) {
    return response.text();
  }).then(function(text) { 
	loadedRes = text.split("\n");
	return loadedRes;
});
	
}


function baseGenerator(year)
{
	var seed = 1;
	const A = 234233466321;
	const B = 785432575563;
	const M = 924314325657;
	for(var i = 0; i<year; i++)
	{
		seed = ((seed+A)*B)%M;
	}
	return seed;
}

function fitRecursively(input,limit)
{
	while(input>limit)
	{
		input = input - limit;
	}
	return input;
}
function loadYear(year)
{
	getFile("numberofcities.txt");
	setTimeout(doYear,2000,year);
}

function getIDforYear(year)
{
	
	var seed = ""+baseGenerator(year);
	console.log(seed);
	if(parseInt(seed.substring(0,2))> 70)
	{
		taskResponse = fitRecursively(parseInt(seed.substring(1,4)),235);
	}
	
}

//due to the asynchronous nature of importing a file there is 2 possible ways of using the data; either I convert my big data set to .js readable files or use a quee based system for laoding resources.
function proccessQueueItem()
{
	switch(taskQueue[0])
	{
		case "getResource":
			taskQueue.shift();
			var resource = taskQueue.shift();
			getFile(resource);
			break;
		case "getCountryIdFromYear":
			taskQueue.shift();
			var year = parseInt(taskQueue.shift());
			getIDforYear(year);
			break;
		case "getTownsInCountryFromId"
			taskQueue.shift();
			var compound = loadedRes.split(",");
			taskResponse = compound[0];
			
			
		
	}
}
