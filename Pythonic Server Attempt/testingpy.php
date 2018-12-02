<?php 
$runlen = (int)htmlspecialchars($_GET["length"]);
$aTown = htmlspecialchars($_GET["town"]);
$option = htmlspecialchars($_GET["option"]);
$seed = htmlspecialchars($_GET["seed"]);


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
	case "simple-seed":
		$output = passthru("python pygen.py ".$runlen." --seed ".$seed);
		echo($output);
		break;
	case "year-seed":
		$output = passthru("python pygen.py ".$runlen." --seed ".$seed." --full");
		echo($output);
		break;
}	
?>