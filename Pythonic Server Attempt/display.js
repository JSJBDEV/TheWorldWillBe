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

// L.marker([-10.4333333,105.6833333]).addTo(map)
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

//-----//

var loadedRes = [];
var fileStore = [];
var cyear = 0;
var hasTimeout = false;
function getFile(url) //using a simple fetch method I can grab my libraries.
{
	document.getElementById("loads").innerHTML = "loading file, please wait....";
	fetch(url)
  .then(function(response) {
    return response.text();
  }).then(function(text) { 
	fileStore = JSON.parse(text);
	document.getElementById("loads").innerHTML = "file loaded";
	return fileStore;
});
}

function fetchSimfile(runlength)
{
	getFile("testingpy.php?length="+runlength+"&town=NA&option=simple");
	
}
var year = 1;
function runSim()
{
	if(loadedRes.length < 1)
	{
		loadedRes = fileStore;
	}
	process = loadedRes[0];
	
	if(process[0] == "~") //symbolises a branched town
	{
		mark = process.substring(1).split(",");
		document.getElementById("yeardata").innerHTML+="<br>"+(mark[0] +" has branched from "+mark[3]);
		addMarker(mark[0],mark[4],subTownIcon,mark[1],mark[2],"<a href='javascript:void(0)' onclick='makeDynamicLink("+'"'+mark[0]+'"'+")'>"+mark[0]+"</a><br>");
		addPolyline(mark[3],[[mark[1],mark[2]],[getMarkerByName(mark[3])._latlng.lat,getMarkerByName(mark[3])._latlng.lng]],"red");
		
	}
	else if(process[0] == "#") //symbolises a marker to be removed
	{
		document.getElementById("yeardata").innerHTML+="<br>"+(process.substring(1)+" has fallen")
		markers.forEach(function(marker)
		{
			if(marker.options.title == process.substring(1))
			{
				map.removeLayer(marker);
				//markers.splice(marker);
			}
		
		});
		
		polylines.forEach(function(line)
		{
			if(line.options.townFrom == process.substring(1))
			{
				map.removeLayer(line);
				//polylines.splice(line);
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
		document.getElementById("yeardata").innerHTML+="<br>"+("@@@year: "+year+" @@@");
	}
	else if(process[0] == ".")
	{
		document.getElementById("yeardata").innerHTML+="<br>"+("---battle started---");
	}
	else if(process[0] == ",")
	{
		document.getElementById("yeardata").innerHTML+="<br>"+("===battle ended===");
	}
	else //refers to a normally generated town
	{
		mark = process.split(",");
		document.getElementById("yeardata").innerHTML+="<br>"+(mark[0]+ " has risen!");
		addMarker(mark[0],mark[0],mainTownIcon,mark[1],mark[2],"<a href='javascript:void(0)' onclick='makeDynamicLink("+'"'+mark[0]+'"'+")'>"+mark[0]+"</a><br>");
	}
	loadedRes.shift();
	if(hasTimeout)
	{
		if(loadedRes.length > 0)
		{
			setTimeout(runSim,50);
		}
		else
		{
			//get next files
		}
	}
	
	
	
}
function makeDynamicLink(townName)
{
	document.getElementById("towninfo").innerHTML = pretifyJson(fileStore.find(x => x.realName == townName));
	//below is ineffecient//
	//document.getElementById("towninfo").innerHTML = "<iframe height=200 width=200 src='testingpy.php?length="+(year+1)+"&option=town&town="+townName.replace(/ /g,"_")+"'></iframe>";
	
}
function pretifyJson(obj)
{
	var tabletext = "<table border='1'>"
	for(line in obj)
	{
		tabletext += "<tr><td>" + line + "</td><td>" + obj[line] + "</td><tr>";
	}
	tabletext += "</table>";
	return tabletext;
	
}

function playpause()
{
	runSim();
	
}
function examine()
{
	markers.forEach(function(marker)
	{
		map.removeLayer(marker);
	});
	markers = []
	polylines.forEach(function(line)
	{
		map.removeLayer(line);
	});
	fileStore.forEach(function(town)
	{
		document.getElementById("yeardata").innerHTML+="<br>"+(town["realName"]);
		if(town["branchedFrom"] == "NA")
		{
			addMarker(town["realName"],town["partOf"],mainTownIcon,town["latitude"],town["longitude"],"<a href='javascript:void(0)' onclick='makeDynamicLink("+'"'+town["realName"]+'"'+")'>"+town["realName"]+"</a><br>");
		}
		else
		{
			addMarker(town["realName"],town["partOf"],subTownIcon,town["latitude"],town["longitude"],"<a href='javascript:void(0)' onclick='makeDynamicLink("+'"'+town["realName"]+'"'+")'>"+town["realName"]+"</a><br>");
			try
			{
			addPolyline(town["branchedFrom"],[[town["latitude"],town["longitude"]],[getTownByName(town["branchedFrom"])["latitude"],getTownByName(town["branchedFrom"])["longitude"]]],"red");
			}
			catch{}
		}
	});
}
function getMarkerByName(name)
{
	return markers.find(x => x.options.title == name);
}
function getTownByName(name)
{
	return fileStore.find(x => x["realName"] == name);
}
function setUpTimeout()
{
	hasTimeout = true;
	setTimeout(runSim,50);
}
function loadExamine()
{
	getFile("testingpy.php?length="+year+"&town=NA&option=year-seed&seed="+document.getElementById("seed").value);
}
function runSimForLen()
{
	getFile("testingpy.php?length="+document.getElementById("forLen").value+"&town=NA&option=simple-seed&seed="+document.getElementById("seed").value);
}
