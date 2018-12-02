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
		$result = mysqli_query($connection,"INSERT INTO `twwb`.`users` (`userID`, `userName`, `userIcon`, `userDataCSV`) VALUES (NULL, '".$name."', '".$icon."', 'wer');");
		echo($result);
		break;
		
	case "signin":
		$userId = (int) htmlspecialchars($_GET["userId"]);
		$result = mysqli_query($connection,"SELECT * FROM `twwb`.`users` WHERE userID = ".$userId);
		while($row = mysqli_fetch_assoc($result))
		{
			print($row["userName"]);
		}
		break;
}
		





?>