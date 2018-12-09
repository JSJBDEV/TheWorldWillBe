<?php
//welcome to the mystical land of php
$name = htmlspecialchars($_GET["name"]);
$ip = $_SERVER['REMOTE_ADDR'];
$action = htmlspecialchars($_GET["action"]);

$connection = mysqli_connect("localhost","root","root","twwb");
print("<script src='gamecode.js'></script><link rel='stylesheet' href='https://www.w3schools.com/w3css/4/w3.css'/>");
if ($connection->connect_error) 
{
	die("Connection failed: " . $conneciton->connect_error);
} 
switch($action)
{
	case "signup":
		$name = htmlspecialchars($_GET["name"]);
		$icon = htmlspecialchars($_GET["icon"]);
		$geoIP = (file_get_contents("http://ip-api.com/json/")); //this needs a .$ip on the end when server is no longer localhost
		$location = json_decode($geoIP,true)["country"];
		$result = mysqli_query($connection,"INSERT INTO `twwb`.`users` (`userID`, `userName`, `userIcon`, `userTrueCountry`,`userIP`) VALUES (NULL, '".$name."', '".$icon."', '".$location."','".$ip."');");
		echo($result);
		break;
		
	case "signin":
		$result = mysqli_query($connection,"SELECT * FROM `twwb`.`users` WHERE userIP = '".$ip."';");
		while($row = mysqli_fetch_assoc($result))
		{
			print("Username: <b>".$row["userName"]."</b><br>");
			print("<img src=".$row["userIcon"]."alt='icon' width='100' height='100'>");
			print("<br>Original Country: <b>".$row["userTrueCountry"]."</b>");
			print("<br>Date Joined: <b>".$row["userCreated"]."</b>");
			$res = mysqli_fetch_row(mysqli_query($connection,"SELECT realName FROM towns WHERE townID=".$row["userResidency"].";"))[0];
			print("<br><br>Current Residency:<button onclick=window.parent.makeDynamicLink('".$row["userResidency"]."')> <b>".$res."</b></button>");
			$loc = mysqli_fetch_row(mysqli_query($connection,"SELECT realName FROM towns WHERE townID='".$row["userLocation"]."';"))[0];
			print("<br>Current Location:<button onclick=window.parent.makeDynamicLink('".$row["userLocation"]."')> <b>".$loc."</b></button>");
			//--may need formatting below this line--//
			if($row["userCooldown"] == 0)
			{
				$feats = explode(",",$row["userFeats"]);
				
				print("<br>Notable Feats:<br><table border='1'><tr><th>Feat</th><th>Effect</th><th>Checks needed</th></tr>");
				
				foreach($feats as $feat)
				{
					$fresult = mysqli_query($connection,"SELECT * FROM feats WHERE featID = '".$feat."';");
					while($frow = mysqli_fetch_assoc($fresult))
					{
						print("<tr><td>".$frow["featName"]."</td><td>".$frow["featModifier"]."</td><td>".$frow["featTime"]."</td><td><button class='w3-btn w3-white w3-border w3-border-blue w3-round' onclick=window.parent.runFeat('".$frow["featID"]."')>Go!</button></td></tr>");
					}
					
				}
				print("</table>");
			}
			else
			{
				print("feat in progress");
			}
			
			
		}
		
		echo($location);
		break;
		
	case "move":
		$newLocation = htmlspecialchars($_GET["newLocation"]);
		$result = mysqli_query($connection,"UPDATE users SET userLocation='".$newLocation."' WHERE userIP = '".$ip."';");
		break;
		
	case "doFeat":
	$feat = htmlspecialchars($_GET["feat"]);
	$user = mysqli_fetch_assoc(mysqli_query($connection,"SELECT * FROM `twwb`.`users` WHERE userIP = '".$ip."';"));
		if($user["userCooldown"] ==0)
		{
			$feats = explode(",",$user["userFeats"]);
			if(in_array($feat,$feats))
			{
				$result = mysqli_query($connection,"INSERT INTO tasks (task,townID,userID) VALUES ('".$feat."','".$user["userLocation"]."','".$user["userID"]."');");
				$cooldown = mysqli_query($connection,"UPDATE users SET userCooldown='1' WHERE userIP = '".$ip."';");
			}
		}
	break;
	case "loadTown":
		$town = str_replace("_"," ",htmlspecialchars($_GET["town"]));
		$result = mysqli_query($connection,"SELECT * FROM towns WHERE townID = '".$town."';");
		while($row = mysqli_fetch_assoc($result))
		{
			print("<br>Town Name: ".$row["realName"]);
			print("<br>Happiness: ".$row["happiness"]);
			print("<br>Founded In: ".$row["foundedYear"]);
			print("<br>Culture Coeffecient: ".$row["culture"]);
			print("<br>Military Coeffecient: ".$row["military"]);
			print("<br>Population (excluding players): ".$row["population"]);
			print("<br>Development Level: ".$row["devLevel"]);
			print("<br>Food Level: ".$row["foodMod"]);
			print("<br>Branched From: ".$row["branchedFrom"]);
			print("<br>Capital of state: ".$row["partOf"]);
			print("<br>Players in town: ");
			$playerRes = mysqli_query($connection,"SELECT userName FROM users WHERE userLocation='".$town."';");
			while($player = mysqli_fetch_array($playerRes))
			{
				print($player[0].",");
			}
			print("<br>Players Residing in town: ");
			$playerRes = mysqli_query($connection,"SELECT userName FROM users WHERE userResidency='".$town."';");
			while($player = mysqli_fetch_array($playerRes))
			{
				print($player[0].",");
			}
			
			
			print("<br><button class='w3-circle w3-hover-teal' onclick='window.parent.switchLocation(".'"'.$row["townID"].'"'.")' class='w3-btn w3-blue-grey'>Travel</button>");
		}
		break;
		
	case "stats":
		print("<select id='statz'><option value='dev'>Development</option><option value='population'>Population</option><option value='happiness'>Happiness</option></select><button onclick='window.parent.lookup()'>Lookup!</button>");
		$stat = htmlspecialchars($_GET["stat"]);
		if($stat == "dev")
		{
			$result = mysqli_query($connection,"SELECT realName,devLevel FROM towns ORDER BY devLevel DESC");
			print("<table class='w3-striped'><tr><th>Town</th><th>Development</th></tr>");
			while($row = mysqli_fetch_assoc($result))
			{
				print("<tr><td>".$row["realName"]."</td><td>".$row["devLevel"]."</td></tr>");
			}
			print("</table>");
		
		}
		if($stat == "happiness")
		{
			$result = mysqli_query($connection,"SELECT realName,happiness FROM towns ORDER BY happiness DESC");
			print("<table class='w3-striped'><tr><th>Town</th><th>Happiness</th></tr>");
			while($row = mysqli_fetch_assoc($result))
			{
				print("<tr><td>".$row["realName"]."</td><td>".$row["happiness"]."</td></tr>");
			}
			print("</table>");
		
		}
		if($stat == "population")
		{
			$result = mysqli_query($connection,"SELECT realName,population FROM towns ORDER BY population DESC");
			print("<table class='w3-striped'><tr><th>Town</th><th>Population</th></tr>");
			while($row = mysqli_fetch_assoc($result))
			{
				print("<tr><td>".$row["realName"]."</td><td>".$row["population"]."</td></tr>");
			}
			print("</table>");
		
		}
		break;
}





?>