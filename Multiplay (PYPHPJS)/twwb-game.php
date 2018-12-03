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
		$result = mysqli_query($connection,"INSERT INTO `twwb`.`users` (`userID`, `userName`, `userIcon`, `userDataCSV`) VALUES (NULL, '".$name."', '".$icon."', '".$location."');");
		echo($result);
		break;
		
	case "signin":
		$userId = (int) htmlspecialchars($_GET["userId"]);
		$result = mysqli_query($connection,"SELECT * FROM `twwb`.`users` WHERE userID = ".$userId);
		while($row = mysqli_fetch_assoc($result))
		{
			print("Username: <b>".$row["userName"]."</b><br>");
			print("<img src=".$row["userIcon"]."alt='icon' width='100' height='100'>");
			$dataCSV = explode(",",$row["userDataCSV"]);//original country,current residence
			print("<br>Original Country: <b>".$dataCSV[0]."</b>");
			
			
		}
		
		echo($location);
		break;
}
		





?>