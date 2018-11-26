<?php 
$runlen = (int)htmlspecialchars($_GET["length"]);
$aTown = htmlspecialchars($_GET["town"]);
$option = htmlspecialchars($_GET["option"]);


switch($option)
{
	case "simple":
		$output = passthru("python pygen.py ".$runlen);
		echo($output);
		break;
	case "town":
		$output = passthru("python pygen.py ".$runlen." --town ".$aTown);
		echo($output);
		break;
	case "year":
		$output = passthru("python pygen.py ".$runlen." --full");
		echo($output);
		break;
}
?>