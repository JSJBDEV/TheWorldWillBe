<?php 
$runlen = (int)htmlspecialchars($_GET["length"]);
$aTown = htmlspecialchars($_GET["town"]);
if($aTown == "NA")
{
	$output = passthru("python pygen.py ".$runlen);
	echo($output);
}
else
{
	$output = passthru("python pygen.py ".$runlen." --town ".$aTown);
	echo($output);
}
?>