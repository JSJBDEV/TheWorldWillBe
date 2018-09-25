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
	var marker = L.marker([lat,lon],{icon: mainTownIcon}).addTo(map).bindPopup(desc);
	markers.push(marker);
	return markers;
}
function removeMarker(id)
{
	map.removeLayer(markers[id]);
	markers.splice(id);
}
//--------------------------------------non map things------------------------//
var ResDomain = "http://jsjbdev.github.io/world/"
var loadedRes = [];
var taskResponse = "";
var countryId = 0;
var taskQueue = [];
var seed = 0;
var towns = [];
var currentYear;

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
	seed = 1;
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
	while(input>=limit)
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
	
	var tseed = ""+baseGenerator(year);
	console.log(tseed);
	if(parseInt(tseed.substring(0,2))> 70)
	{
		countryId = fitRecursively(parseInt(tseed.substring(1,4)),235);
	}
	else
	{
		taskQueue.splice(0,4);
	}
	
}


//due to the asynchronous nature of importing a file there is 2 possible ways of using the data; either I convert my big data set to .js readable files or use a quee based system for loading resources.
function proccessQueueItem()
{
	document.getElementById("taskdisplay").innerHTML = taskQueue;
	switch(taskQueue[0])//REQUIRES = R: OUTPUTS= O:
	{
		case "loadCityNumbers": //R:FileUrl O: Numbers File
			
			getFile("numberofcities.txt");
			shiftIfSuccess();
			break;
			
		case "getCountryIdFromYear": // R: Year O: Country ID
			
			var year = parseInt(currentYear);
			getIDforYear(year);
			lastTown = "none";
			shiftIfSuccess();
			break;
			
		//----Below this line all tasks take global inputs, such as seed or Country File----//	
		
		case "getTownsInCountryFromId": //R: Country ID O: Number of Towns (task)
			
			var compound = loadedRes[parseInt(countryId)];
			compound = compound.split(",");
			taskResponse = compound[1];
			console.log(taskResponse);
			shiftIfSuccess();
			break;
			
		case "getCountryCodeFromId": //R: Country ID O: Country Code (task)
			
			var compound = loadedRes[parseInt(countryId)];
			compound = compound.split(",");
			taskResponse = compound[0];
			console.log(taskResponse);
			shiftIfSuccess();
			break;
		
		case "loadCountryFromID": //R: Country ID, Numbers File: O: Country file (Resource)
			
			var compound = loadedRes[parseInt(countryId)];
			compound = compound.split(",");
			getFile("countries/"+compound[0]+".txt");
			shiftIfSuccess();
			break;
		case "loadCountryFromCode": //R Country Code (next) o: Country File (Resource)
			taskQueue.shift();
			getFile("countries/"+taskQueue.shift()+".txt");
			break;
		
		case "getRegionInCountry": //R: Country File, Region (next) O: Region in country (Resource)
			taskQueue.shift();
			var regionRes = loadedRes.filter(findTownsInRegion);
			loadedRes = regionRes;
			shiftIfSuccess();
			break;
			
		case "getTownsInList": //R: Country/Region File O: Number of Towns
			taskResponse = loadedRes.length;
			shiftIfSuccess();
			
			
		case "pickTown": //R: Number of Towns (task), seed, Country/Region File,  O: A Town (task)
			
			var tseed = ""+seed;
			tseed = tseed.substring(2,9);
			var townEquiv = fitRecursively(parseInt(tseed),parseInt(taskResponse)); //Number Of Towns
			console.log(townEquiv);
			taskResponse = loadedRes[townEquiv];
			shiftIfSuccess();
			break;
		
		case "startCiv": //R: A Town (task) O: A Civilisation Object (returing the town added) (task)
			
			var compound = taskResponse.split(",");
			towns.push(new Town(compound[0],compound[1],compound[3],compound[5],compound[6]));
			taskResponse = towns[towns.length-1];
			
			shiftIfSuccess();
			break;
		case "checkCivs": //UTILITY O: tasks for town expansion
			towns.forEach(townIterate);
			taskQueue.shift();
			break;
		case "checkConnections": //R: A new town (task from startCiv), The original town (from next) O: draw lines in nations.
			taskQueue.shift()
			var oldTown = taskQueue.shift();
			taskResponse.branchedFrom = oldTown.realName;
			addPolyline([[taskResponse.latitude,taskResponse.longitude],[oldTown.latitude,oldTown.longitude]],getTownColour(oldTown));
			
			
		
	}

}
function shiftIfSuccess()
{
	if(taskResponse !== undefined && countryId !== undefined && loadedRes !== undefined)
	{
		taskQueue.shift();
	}
}
//---------------------Towns--------------------//
function Town(realCountry,realName,realRegion,latitude,longitude) //magical town object, will contain all information about the town.
{	this.foundedYear = currentYear;
	this.realCountry = realCountry;
	this.realRegion = realRegion;
	this.realName = realName;
	this.latitude = latitude;
	this.longitude = longitude;
	this.townseed = baseGenerator(222+towns.length);
	this.population = 1;
	this.devLevel = 10;
	this.branchedFrom = "N/A";
	addMarker(latitude,longitude,"<a href='javascript:void(0)' onclick='generateTownPage(getTownByRealName("+'"'+realName+'"'+"))'>"+realName+"</a><br><img src='http://flag-designer.appspot.com/gwtflags/SvgFileService?d=0&c1=5&c2=3&c3=6&o=2&c4=5&s=13&c5=1' alt='svg' width='60' height='40'/>");
	
}
function getTownByRealName(name)
{
	return towns.find(x => x.realName === name);
}
function generateTownPage(town)
{
	document.getElementById("maindisplay").innerHTML = "Town Name: "+town.realName+"<br>(IRL Country): "+town.realCountry+"<br>Year First Founded:"+town.foundedYear+"<br>(IRL Region): "+town.realRegion+"<br> Population: "+town.population+"<br> Branched From: "+town.branchedFrom;
}
//----------------------------------------------//
function genDefaultTasks()
{
	taskQueue = ["loadCityNumbers","getCountryIdFromYear","getTownsInCountryFromId","loadCountryFromID","pickTown","startCiv","checkCivs"];
	
}
function simYear()
{
	currentYear = document.getElementById("numberbox").value
	genDefaultTasks();
	
}
function townIterate(town)
{
	
	if(town.population > town.devLevel)
	{
		taskQueue.push("loadCountryFromCode",town.realCountry,"getRegionInCountry",town.realRegion,"getTownsInList","pickTown","startCiv","checkConnections",town);
		town.population = Math.floor(town.population/2);
	}
	var tseed = town.townseed+"";
	town.population = town.population + Math.floor((parseInt(tseed[1]) * (parseInt(currentYear)-town.foundedYear)+1)/2); //while this equation does work when picking random years, it would be bette to consider it 1 year at a time.
}

function findTownsInRegion(town) //assumes that the loaded country is the country to be searched
{
	if(town.split(",")[3] == taskQueue[0])
	{
		return true;
	}
	else
	{
		return false;
	}
}
function getTownColour(town)
{
	var red = parseInt(fitRecursively(town.townseed.toString().substring(0,3),255)).toString(16);
	if(red.toString().length < 2)
	{
		red = "0"+red;
	}
	var green = parseInt(fitRecursively(town.townseed.toString().substring(3,6),255)).toString(16);
	if(green.toString().length < 2)
	{
		green = "0"+green;
	}
	var blue = parseInt(fitRecursively(town.townseed.toString().substring(6,9),255)).toString(16);
	if(blue.toString().length < 2)
	{
		blue = "0"+blue
	}
	return "#"+red+green+blue;
}



if(typeof(Storage) === undefined)
{
	document.getElementById("numberbox").innerHTML = "use a newer browser otherwise no data will be saved!";
}
setInterval(proccessQueueItem,500);