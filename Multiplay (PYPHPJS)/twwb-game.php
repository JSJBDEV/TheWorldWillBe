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
			print("<br><br>Current Residency: <b>".$row["userResidency"]."</b>");
			print("<br>Current Location: <b>".$row["userLocation"]."</b>");
			//--may need formatting below this line--//
			print("<br>Notable Feats: <b>".$row["userFeats"]."</b>");
			
			
			
		}
		
		echo($location);
		break;
}
		





?>