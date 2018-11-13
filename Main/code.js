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

//--------------------------------------non map things------------------------//
var ResDomain = "http://jsjbdev.github.io/world/"
var loadedRes = [];
var taskResponse = "";
var countryId = 0;
var taskQueue = [];
var seed = 0;
var towns = [];
var currentYear = 0;

function getFile(url) //using a simple fetch method I can grab my libraries.
{
fetch(ResDomain+url)
  .then(function(response) {
    return response.text();
  }).then(function(text) { 
	loadedRes = text.split("\n");
	taskQueue.shift();
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
	//console.log(tseed);
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
	document.getElementById("year").innerHTML = "Year: "+currentYear;
	document.getElementById("taskdisplay").innerHTML = taskQueue;
	if(taskResponse !== undefined)
	{
		switch(taskQueue[0])//REQUIRES = R: OUTPUTS= O:
		{
			case "loadCityNumbers": //R:FileUrl O: Numbers File
				towns.forEach(function(town){
					if(town.removable == true)
					{
						removeNation(town.partOf);
					}
						});
				getFile("numberofcities.txt");
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
				//console.log(taskResponse);
				shiftIfSuccess();
				break;
				
			case "getCountryCodeFromId": //R: Country ID O: Country Code (task)
				
				var compound = loadedRes[parseInt(countryId)];
				compound = compound.split(",");
				taskResponse = compound[0];
				//console.log(taskResponse);
				shiftIfSuccess();
				break;
			
			case "loadCountryFromID": //R: Country ID, Numbers File: O: Country file (Resource)
				if(loadedRes !== undefined)
				{
					var compound = loadedRes[parseInt(countryId)];
					compound = compound.split(",");
					getFile("countries/"+compound[0]+".txt");
				}
				break;
			case "loadCountryFromCode": //R Country Code (next) o: Country File (Resource)
				if(loadedRes !== undefined)
				{
					getFile("countries/"+taskQueue[1]+".txt");
					shiftIfSuccess();
				}
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
				break;
				
				
			case "pickTown": //R: Number of Towns (task), seed, Country/Region File,  O: A Town (task)
				
				var tseed = ""+seed;
				tseed = tseed.substring(2,9);
				var townEquiv = fitRecursively(parseInt(tseed),parseInt(taskResponse)); //Number Of Towns
				//console.log(townEquiv);
				taskResponse = loadedRes[townEquiv];
				shiftIfSuccess();
				break;
			
			case "startCiv": //R: A Town (task) O: A Civilisation Object (returing the town added) (task)
				
				var compound = taskResponse.split(",");
				if(compound.length > 2)
				{
					
					towns.push(new Town(compound[0],compound[1],compound[3],compound[5],compound[6]));
					taskResponse = towns[towns.length-1];
				}
				
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
				addPolyline(oldTown.realName,[[taskResponse.latitude,taskResponse.longitude],[oldTown.latitude,oldTown.longitude]],getTownColour(oldTown));
				
				removeMarker(markers.length-1);
				var flagArray = [fitRecursively(parseInt(getTownByRealName(oldTown.partOf).townseed.substring(0,2)),11),fitRecursively(parseInt(getTownByRealName(oldTown.partOf).townseed.substring(1,9)),7),fitRecursively(parseInt(getTownByRealName(oldTown.partOf).townseed.substring(7,3)),7),fitRecursively(parseInt(getTownByRealName(oldTown.partOf).townseed.substring(2,4)),7),fitRecursively(parseInt(getTownByRealName(oldTown.partOf).townseed.substring(3,5)),11),fitRecursively(parseInt(getTownByRealName(oldTown.partOf).townseed.substring(4,6)),7),fitRecursively(parseInt(getTownByRealName(oldTown.partOf).townseed.substring(5,7)),17),fitRecursively(parseInt(getTownByRealName(oldTown.partOf).townseed.substring(6,8)),7)];
				addMarker(taskResponse.realName,subTownIcon,taskResponse.latitude,taskResponse.longitude,"<a href='javascript:void(0)' onclick='generateTownPage(getTownByRealName("+'"'+taskResponse.realName+'"'+"))'>"+taskResponse.realName+"</a><br><img src='http://flag-designer.appspot.com/gwtflags/SvgFileService?d="+flagArray[0]+"&c1="+flagArray[1]+"&c2="+flagArray[2]+"&c3="+flagArray[3]+"&o="+flagArray[4]+"&c4="+flagArray[5]+"&s="+flagArray[6]+"&c5="+flagArray[7]+"' alt='svg' width='60' height='40'/>");
				
				taskResponse.partOf = oldTown.partOf;
				oldTown.resources = oldTown.resources+taskResponse.resources;
				break;
			case "getNearbyTowns": //O: Retrieves compareable list.
				getFile("compare.txt");
				break;
			case "getAnotherRegion": //R: compare.txt and town (next) O: a town instance
				taskQueue.shift();
				var aTown = taskQueue.shift();
				var potentialTowns = [];
				loadedRes.forEach(function(townIns)
				{
					var splitTown = townIns.split(",");
					if(getLLDistance(splitTown[5],splitTown[6],aTown.latitude,aTown.longitude) < aTown.devLevel*aTown.resources)
					{
						potentialTowns.push(townIns);
					}
				});
				taskResponse = potentialTowns[fitRecursively(parseInt(aTown.townseed.substring(5,7)),potentialTowns.length-1)];
				break;
			
		}
	}
	continueSim();
}
function continueSim()
{
	//console.log("triggered");
	if(taskQueue.length == 0)
	{
		currentYear = parseInt(currentYear)+1;
		genDefaultTasks();
	}
	if(taskQueue[0] == "startCiv" && taskResponse.split(",").length < 2)
	{
		taskQueue.unshift("v");
	}
	if(taskResponse === undefined)
	{
		genDefaultTasks();
		setTimeout(proccessQueueItem,1000);
	}
	else
	{
		setTimeout(proccessQueueItem,100);
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
	this.realName = realName.replace(/"|'/gi,"`");
	this.latitude = latitude;
	this.longitude = longitude;
	this.townseed = ""+baseGenerator(222+towns.length);
	this.population = 1;
	this.devLevel = 100;
	this.happiness = 100;
	this.resources = parseInt(this.townseed.substring(4,6));
	this.foodMod = 5;
	this.branchedFrom = "N/A";
	this.partOf = this.realName;
	var flagArray = [fitRecursively(parseInt(this.townseed.substring(0,2)),11),fitRecursively(parseInt(this.townseed.substring(1,9)),7),fitRecursively(parseInt(this.townseed.substring(7,3)),7),fitRecursively(parseInt(this.townseed.substring(2,4)),7),fitRecursively(parseInt(this.townseed.substring(3,5)),11),fitRecursively(parseInt(this.townseed.substring(4,6)),7),fitRecursively(parseInt(this.townseed.substring(5,7)),17),fitRecursively(parseInt(this.townseed.substring(6,8)),7)];
	addMarker(this.realName,mainTownIcon,latitude,longitude,"<a href='javascript:void(0)' onclick='generateTownPage(getTownByRealName("+'"'+realName+'"'+"))'>"+realName+"</a><br><img src='http://flag-designer.appspot.com/gwtflags/SvgFileService?d="+flagArray[0]+"&c1="+flagArray[1]+"&c2="+flagArray[2]+"&c3="+flagArray[3]+"&o="+flagArray[4]+"&c4="+flagArray[5]+"&s="+flagArray[6]+"&c5="+flagArray[7]+"' alt='svg' width='60' height='40'/>");
	
}

function getTownByRealName(name)
{
	return towns.find(x => x.realName === name);
}
function generateTownPage(town)
{
	document.getElementById("maindisplay").innerHTML = "Town Name: "+town.realName+"<br>(IRL Country): "+town.realCountry+"<br>Year First Founded:"+town.foundedYear+"<br>(IRL Region): "+town.realRegion+"<br> Population: "+town.population+"<br>Dev Level:"+town.devLevel+"<br> Branched From: "+town.branchedFrom+"<br> Part of: "+town.partOf+" Republic <br> Happiness: "+town.happiness+"<br> Resources: "+town.resources+"<br>  Food Modifier: "+town.foodMod;
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
function playpause()
{
	if(taskQueue[0] == "paused")
	{
		taskQueue.shift();
	}
	else
	{
		taskQueue.push("paused");
	}
}
function townIterate(town)
{
	var tseed = town.townseed+"";
	var yseed = ""+seed;
	var ratioseed = ""+(parseInt(town.townseed) % seed);
	town.foodMod = parseInt(ratioseed.substring(1,2))+1;
	if(town.foodMod == 2 || town.foodMod == 3)
	{
		getTownByRealName(town.partOf).resources = getTownByRealName(town.partOf).resources-1;
	}
	if(town.foodMod == 1)
	{
		getTownByRealName(town.partOf).resources = getTownByRealName(town.partOf).resources-2;
	}
	if(town.foodMod == 8 || town.foodMod == 9)
	{
		getTownByRealName(town.partOf).resources = getTownByRealName(town.partOf).resources+1;
	}
	if(town.foodMod == 10)
	{
		getTownByRealName(town.partOf).resources = getTownByRealName(town.partOf).resources+2;
	}
	if(town.population > town.devLevel)
	{
		if(parseInt(ratioseed.substring(2,4)) > 20 && town.devLevel > 5000)
		{
			taskQueue.push("getNearbyTowns","getAnotherRegion",town,"startCiv","checkConnections",town);
		}
		else
		{
			taskQueue.push("loadCountryFromCode",town.realCountry,"getRegionInCountry",town.realRegion,"getTownsInList","pickTown","startCiv","checkConnections",town);
		}
		town.population = Math.floor(town.population/2);
	}
	
	town.population = town.population + Math.floor((parseInt(tseed[1]) * (parseInt(currentYear)-town.foundedYear)+1)/2); 
	town.devLevel = town.devLevel + (parseInt(yseed.substring(2,4))+Math.floor(0.1*(parseInt(tseed.substring(1,3))))); 
	if(parseInt(ratioseed.substring(3,5)) >= 50)
	{
		town.happiness = town.happiness+1;
	}
	else
	{
		town.happiness = town.happiness-1;
	}
	if(town.devLevel < (getTownByRealName(town.partOf).devLevel/2))
	{
		getTownByRealName(town.partOf).resources = getTownByRealName(town.partOf).resources-1;
	}
	if(getTownByRealName(town.partOf).resources < 0)
	{
		console.log(town.partOf+" has fallen");
		town.removable = true;
	}
	if(town.happiness < 20)
	{
		//start a revolution
	}
	
	
}
function battle(side1,side2,iterableSeed)
{
	var x = iterableSeed
	const a = 348563563
	const b = 126431247
	const m = 935623331
	while(side1.length>0)
	{
			x = (((x+a)*b)%m)
			member = side1[0];
			opposition = side2[0];
			if(parseInt(x.toString().substring(1,2))>parseInt(x.toString().substring(3,4)))
			{
				var newHP = opposition-member;
				console.log("side1 wins");
				side2.shift();
				if(newHP>0)
				{
					side2.push(newHP);
				}
			}
			else
			{
				var newHP = member-opposition;
				console.log("side2 wins");
				side1.shift();
				if(newHP>0)
				{
					side1.push(newHP);
				}
			}
			if(side2.length == 0)
			{
				console.log("side1 won the battle");
				return side1;
			}
			
			
	}
	console.log("side 2 won the battle");
	return side2;
}
{
	
}
function generateEvents()
{
	
}
function removeNation(origin)
{	
	markers.forEach(function(town){
		if(findAllTownsInNation(origin).includes(getTownByRealName(town.options.title)))
		{
			map.removeLayer(town);
		}
	});
	polylines.forEach(function(path){
		if(findAllTownsInNation(origin).includes(getTownByRealName(path.options.townFrom)))
		{
			map.removeLayer(path);
		}
	});
	towns = towns.filter(x => !findAllTownsInNation(origin).includes(x));
	
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
function sortHappiness() //returns the array of towns but sorted with the happiest first. (with help from w3schools)
{
		happinessarray = towns.sort(function(a,b){return b.happiness - a.happiness})
		return happinessarray
}
function sortResources() //returns the array of towns but sorted with the happiest first. (with help from w3schools)
{
		resourcesarray = towns.sort(function(a,b){return b.resources - a.resources})
		return resourcesarray
}
function findAllTownsInNation(origin)
{ 
	return towns.filter(x => x.partOf === origin);
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
function getArrayOfNearbyCities(townFrom)
{
	return towns.filter(x => getTownDistance(townFrom,x)< townFrom.devLevel*townFrom.resources);
}
function radians(degrees)
{
	return degrees * (Math.PI/180);
}
function getTownDistance(town1,town2)
{
	var R = 6371e3; // this is the haversine formula for converting a set of coordinates to distance. it is freely available from https://www.movable-type.co.uk/scripts/latlong.html I have made it work (using radians() and integrating towns)
	var φ1 = radians(town1.latitude);
	var φ2 = radians(town2.latitude);
	var Δφ = radians(town2.latitude-town1.latitude);
	var Δλ = radians(town2.longitude-town1.longitude);

	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
			Math.cos(φ1) * Math.cos(φ2) *
			Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;
	return d;
}
function getLLDistance(lat1,long1,lat2,long2)
{
	var R = 6371e3; 
	var φ1 = radians(lat1);
	var φ2 = radians(lat2);
	var Δφ = radians(lat2-lat1);
	var Δλ = radians(long2-long1);

	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
			Math.cos(φ1) * Math.cos(φ2) *
			Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;
	return d;
}
function makeJSON()
{
	return JSON.stringify(towns);
}
function reparseTowns(jsonTowns)
{
	towns = JSON.parse(jsonTowns);
	markers.forEach(function(marker){removeMarker(markers.indexOf(marker))});
	polylines.forEach(function(polyline){removePolyline(polylines.indexOf(polyline))});
	towns.forEach(function(town)
	{
		var flagArray = [fitRecursively(parseInt(town.townseed.substring(0,2)),11),fitRecursively(parseInt(town.townseed.substring(1,9)),7),fitRecursively(parseInt(town.townseed.substring(7,3)),7),fitRecursively(parseInt(town.townseed.substring(2,4)),7),fitRecursively(parseInt(town.townseed.substring(3,5)),11),fitRecursively(parseInt(town.townseed.substring(4,6)),7),fitRecursively(parseInt(town.townseed.substring(5,7)),17),fitRecursively(parseInt(town.townseed.substring(6,8)),7)];
		var usedIcon = mainTownIcon;
		if(town.branchedFrom !== "N/A")
		{
			usedIcon = subTownIcon;
			addPolyline(town.branchedFrom,[[town.latitude,town.longitude],[getTownByRealName(town.branchedFrom).latitude,getTownByRealName(town.branchedFrom).longitude]],getTownColour(getTownByRealName(town.branchedFrom)));
		}
		addMarker(town.realName,mainTownIcon,town.latitude,town.longitude,"<a href='javascript:void(0)' onclick='generateTownPage(getTownByRealName("+'"'+town.realName+'"'+"))'>"+town.realName+"</a><br><img src='http://flag-designer.appspot.com/gwtflags/SvgFileService?d="+flagArray[0]+"&c1="+flagArray[1]+"&c2="+flagArray[2]+"&c3="+flagArray[3]+"&o="+flagArray[4]+"&c4="+flagArray[5]+"&s="+flagArray[6]+"&c5="+flagArray[7]+"' alt='svg' width='60' height='40'/>");
		
	});
}


if(typeof(Storage) === undefined)
{
	document.getElementById("numberbox").innerHTML = "use a newer browser otherwise no data will be saved!";
}
setTimeout(proccessQueueItem,100);