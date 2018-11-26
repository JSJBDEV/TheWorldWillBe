var markers = [];
var polygons = [];
var polylines = [];
var map = L.map('map', {
	minZoom: 1,
	maxZoom: 16,
	renderer: L.svg()  
});

var cartodbAttribution = '&copy; <a href="https://earthobservatory.nasa.gov/">NASA</a>';

var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
}).addTo(map);

var myIcon = L.icon({
	//#d=11&c1=7&c2=7&c3=7&o=11&c4=7&s=17&c5=7 (highest values)
	iconUrl: 'http://flag-designer.appspot.com/gwtflags/SvgFileService?d=0&c1=5&c2=3&c3=6&o=2&c4=5&s=13&c5=1',
	iconSize: [60,40],
	iconAnchor: [30, 20],
	popupAnchor: [0, -5],
	});
	
var subTownIcon = L.icon({
	iconUrl: 'http://clipart.nicubunu.ro/svg/rpg_map/farm.svg',
	iconSize: [60,50],
	iconAnchor: [30, 20],
	popupAnchor: [0, -5],});
	
var mainTownIcon = L.icon({
	iconUrl: 'http://clipart.nicubunu.ro/svg/rpg_map/fort.svg',
	iconSize: [60,50],
	iconAnchor: [30, 20],
	popupAnchor: [0, -5],});


map.setView([0, 0], 0);

 L.marker([-10.4333333,105.6833333]).addTo(map)
.bindPopup('<a href="https://earthobservatory.nasa.gov/">NASA</a>');

var latlngs = [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]];
var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);

//funcions by me//
function addPolygon(latlngs,colour)
{
	var polygon = L.polygon(latlngs, {color: colour}).addTo(map);
	polygons.push(polygon);
	return polygon;
	
}
function addPolyline(townF,latlngs,colour)
{
	var polyline = L.polyline(latlngs, {color: colour, townFrom: townF}).addTo(map);
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

function addMarker(name,iconIn,lat,lon,desc)
{
	var marker = L.marker([lat,lon],{icon: iconIn, title:name}).addTo(map).bindPopup(desc);
	markers.push(marker);
	return markers;
}
function removeMarker(id)
{
	map.removeLayer(markers[id]);
	markers.splice(id);
}
var loadedRes = [];
var cyear = 0;
function getFile(url) //using a simple fetch method I can grab my libraries.
{
	fetch(url)
  .then(function(response) {
    return response.text();
  }).then(function(text) { 
	loadedRes = JSON.parse(text);
	return loadedRes;
});
}

function fetchSimfile(runlength)
{
	getFile("testingpy.php?length="+runlength+"&town=NA&option=simple");
	
}
var year = 1;
function runSim()
{
	process = loadedRes[0];
	
	if(process[0] == "~") //symbolises a branched town
	{
		mark = process.substring(1).split(",");
		addMarker(mark[0],subTownIcon,mark[1],mark[2],"<a href='javascript:void(0)' onclick='makeDynamicLink("+'"'+mark[0]+'"'+")'>"+mark[0]+"</a><br>");
		addPolyline(mark[3],[[mark[1],mark[2]],[getMarkerByName(mark[3])._latlng.lat,getMarkerByName(mark[3])._latlng.lng]],"red");
		
	}
	else if(process[0] == "#") //symbolises a marker to be removed
	{
		map.removeLayer(markers.find(x => x.options.title == process.substring(1)));
		//map.removeLayer(polylines.find(x => x.options.townFrom == process.substring(1)));
		polylines.forEach(function(line)
		{
			if(line.options.townFrom == process.substring(1))
			{
				map.removeLayer(line)
			}
		});
	}
	else if(process[0] == "-")
	{
		//(do nothing)
		
	}
	else if(process[0] == "$")
	{
		year++;
		document.getElementById("year").innerHTML="Year: "+year;
	}
	else if(process[0] == ".")
	{
		console.log("battle started");
	}
	else if(process[0] == ",")
	{
		console.log("battle ended");
	}
	else //refers to a normally generated town
	{
		mark = process.split(",");
		addMarker(mark[0],mainTownIcon,mark[1],mark[2],"<a href='javascript:void(0)' onclick='makeDynamicLink("+'"'+mark[0]+'"'+")'>"+mark[0]+"</a><br>");
	}
	loadedRes.shift();
	
}
function makeDynamicLink(townName)
{
	console.log("it worked");
	document.getElementById("towninfo").innerHTML = "<iframe height=200 width=200 src='testingpy.php?length="+(year+1)+"&option=town&town="+townName.replace(/ /g,"_")+"'></iframe>";
}
function playpause()
{
	runSim();
	
}
function getMarkerByName(name)
{
	return markers.find(x => x.options.title == name);
}


