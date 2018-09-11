var markers = [];
var polygons = [];
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

function doYear(year)
{
	var seed = ""+baseGenerator(year);
	console.log(seed);
	if(parseInt(seed.substring(0,2))> 70)
	{
		var countryId = fitRecursively(parseInt(seed.substring(1,4)),235);
		var countries = getFile("numberofcities.txt");
		var countryReference = countries[countryId-1];
		console.log(countries);
		return countryReference;
		
	}
	
}
