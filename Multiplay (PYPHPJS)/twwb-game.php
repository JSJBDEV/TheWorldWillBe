<?php
//welcome to the mystical land of php
$name = htmlspecialchars($_GET["name"]);
$ip = $_SERVER['REMOTE_ADDR'];
$action = htmlspecialchars($_GET["action"]);

$connection = mysqli_connect("localhost","root","root","twwb");
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
			print("<br><br>Current Residency: <b>".$res."</b>");
			$loc = mysqli_fetch_row(mysqli_query($connection,"SELECT realName FROM towns WHERE townID='".$row["userLocation"]."';"))[0];
			print("<br>Current Location: <b>".$loc."</b>");
			//--may need formatting below this line--//
			$feats = explode(",",$row["userFeats"]);
			print("<br>Notable Feats:<br><table border='1'><tr><th>Feat</th><th>Effect</th><th>Checks needed</th></tr>");
			foreach($feats as $feat)
			{
				$fresult = mysqli_query($connection,"SELECT * FROM feats WHERE featID = '".$feat."';");
				while($frow = mysqli_fetch_assoc($fresult))
				{
					print("<tr><td>".$frow["featName"]."</td><td>".$frow["featModifier"]."</td><td>".$frow["featTime"]."</td></tr>");
				}
				
			}
			print("</table>");
			
			
			
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
			}
		}
	break;
	case "loadTown":
		$town = str_replace("_"," ",htmlspecialchars($_GET["town"]));
		$result = mysqli_query($connection,"SELECT * FROM towns WHERE realName = '".$town."';");
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
		}
}
		





?>