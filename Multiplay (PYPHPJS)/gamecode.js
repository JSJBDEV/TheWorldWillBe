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

 //L.marker([-10.4333333,105.6833333]).addTo(map)
//.bindPopup('<a href="https://earthobservatory.nasa.gov/">NASA</a>');

//var latlngs = [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]];
//var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);

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

function addMarker(name,origin,iconIn,lat,lon,desc)
{
	var marker = L.marker([lat,lon],{icon: iconIn, title:name, torigin:origin}).addTo(map).bindPopup(desc);
	markers.push(marker);
	return markers;
}
function removeMarker(id)
{
	map.removeLayer(markers[id]);
	markers.splice(id);
}



//so basically, this script has almost nothing to do with display.js as it has to interperate towns differently

fileStore = [];
function getFile(url) //using a simple fetch method I can grab my libraries.
{
	fetch(url)
  .then(function(response) {
    return response.text();
  }).then(function(text) { 
	fileStore = JSON.parse(text);
	return fileStore;
});
}
function profile()
{
	document.getElementById("otherdata").innerHTML = "<iframe src='twwb-game.php?action=signin' width=500 height=500 frameBorder='0'></iframe>";
	document.getElementById("map").setAttribute("hidden",true);
	document.getElementById("otherdata").removeAttribute("hidden");
	
	
}
function otherProfile(other)
{
	document.getElementById("otherdata").innerHTML = "<iframe src='twwb-game.php?action=viewProfile&userid="+other+"' width=500 height=500 frameBorder='0'></iframe>";
	document.getElementById("map").setAttribute("hidden",true);
	document.getElementById("otherdata").removeAttribute("hidden");
}
function getMap()
{
	document.getElementById("map").removeAttribute("hidden");
	document.getElementById("otherdata").setAttribute("hidden",true);
	
}
function getStats()
{
	document.getElementById("otherdata").innerHTML = "<iframe id=statframe src='twwb-game.php?action=stats&stat=dev' width=500 height=500 frameBorder='0'></iframe>";
	document.getElementById("map").setAttribute("hidden",true);
	document.getElementById("otherdata").removeAttribute("hidden");
}
function getSearch()
{
	document.getElementById("otherdata").innerHTML = "<iframe id=searchframe src='twwb-game.php?action=search&query=.' width=500 height=500 frameBorder='0'></iframe>";
	document.getElementById("map").setAttribute("hidden",true);
	document.getElementById("otherdata").removeAttribute("hidden");
}

function loadMap()
{
	fileStore.forEach(function(town)
	{
		console.log(town["realName"]);
		if(town["branchedFrom"] == "NA")
		{
			addMarker(town["townId"],town["partOf"],mainTownIcon,town["latitude"],town["longitude"],"<a href='javascript:void(0)' onclick='makeDynamicLink("+'"'+town["townId"]+'"'+")'>"+town["realName"]+"</a><br>");
		}
		else
		{
			addMarker(town["townId"],town["partOf"],subTownIcon,town["latitude"],town["longitude"],"<a href='javascript:void(0)' onclick='makeDynamicLink("+'"'+town["townId"]+'"'+")'>"+town["realName"]+"</a><br>");
			
			addPolyline(town["branchedFrom"],[[town["latitude"],town["longitude"]],[getTownByName(town["branchedFrom"])["latitude"],getTownByName(town["branchedFrom"])["longitude"]]],"red");
			
		}
	});
}
function switchLocation(newLoc)
{
	fetch("twwb-game.php?action=move&newLocation="+newLoc);
	
	document.getElementById("map").removeAttribute("hidden");
	document.getElementById("otherdata").setAttribute("hidden",true);
	map.panTo(getMarkerByName(newLoc)._latlng);
	map.setZoom(5);
	
}
function showLocation(newLoc)
{	
	document.getElementById("map").removeAttribute("hidden");
	document.getElementById("otherdata").setAttribute("hidden",true);
	map.panTo(getMarkerByName(newLoc)._latlng);
	map.setZoom(5);
	
}

function lookup()
{
	var sel = document.getElementById("statframe").contentWindow.document.getElementById("statz");
	document.getElementById("otherdata").innerHTML = "<iframe src='twwb-game.php?action=stats&stat="+sel.options[sel.selectedIndex].value+"' width=500 height=500 frameBorder='0'></iframe>";
	document.getElementById("map").setAttribute("hidden",true);
	document.getElementById("otherdata").removeAttribute("hidden");
}

function makeDynamicLink(town)
{	
	map.panTo(getMarkerByName(town)._latlng);
	document.getElementById("otherdata").innerHTML = "<iframe src='twwb-game.php?action=loadTown&town="+town+"' width=500 height=500 frameBorder='0'></iframe>";
	document.getElementById("map").setAttribute("hidden",true);
	document.getElementById("otherdata").removeAttribute("hidden");
}
function runFeat(feat)
{
	fetch("twwb-game.php?action=doFeat&feat="+feat);
	profile();
	
}
function searchFor()
{
	
	var query = document.getElementById("searchframe").contentWindow.document.getElementById("searchbar").value;
	document.getElementById("otherdata").innerHTML = "<iframe id=searchframe src='twwb-game.php?action=search&query="+query+"' width=500 height=500 frameBorder='0'></iframe>";
	document.getElementById("map").setAttribute("hidden",true);
	document.getElementById("otherdata").removeAttribute("hidden");
	
	
}

function getTownByName(name)
{
	return fileStore.find(x => x["realName"] == name);
}
function getMarkerByName(name)
{
	return markers.find(x => x.options.title == name);
}
getFile("dumps/town_dump.txt");
setTimeout(loadMap,1000);