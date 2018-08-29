const long0 = 3500
const lat0 = 2500

function makeImage(imagestring,context,posX,posY)
{
	var img = new Image();
	img.width = 1000;
	img.src = imagestring;
	
	img.onload = function(){context.drawImage(img,posX,posY)}
}


function drawMap()
{
	document.getElementById("mainData").innerHTML = "<canvas id='canv' width='7000' height='5000' onclick=canvasClick(event)><canvas>"
	var c = document.getElementById("canv");
	var ctx = c.getContext("2d");
	
	makeImage("map.gif",ctx,0,0);
	
	
}
function drawOverlay()
{
	var canvas = document.getElementById("canv");
	var ctx = canvas.getContext("2d");
	ctx.moveTo(long0,lat0);
	ctx.lineTo(long0+1,lat0);
	ctx.stroke();
}
function mapDot(lat,lon)
{
	var rlon = long0 + (lon * 21.3 - lon*1.5);
	var rlat = lat0 - (lat * 22.0);
	//51.475,0 "london"
	var canvas = document.getElementById("canv");
	var ctx = canvas.getContext("2d");
	ctx.moveTo(rlon,rlat);
	ctx.lineTo(rlon+100,rlat);
	ctx.stroke();

}
function canvasClick(event)
{
	drawOverlay();
	mapDot(60,0); //london
	mapDot(-51.606394, -59.518544); //top right of left falkland
	mapDot(-4.652782, 55.447799); //somewhere in ghana
	mapDot(21.896593, -160.156764);
}
drawMap();
