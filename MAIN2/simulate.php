<?php
$cyear = htmlspecialchars($_GET["year"]);
$towns = [];

function baseGenerator($year)
{
	$seed = 1;
	$A = 234233466321;
	$B = 785432575563;
	$M = 924314325657;
	for($i = 0; $i<$year; $i++)
	{
		$seed = fmod((($seed+$A)*$B),$M);
	}
	return abs($seed);
}

function fitRecursively($input,$limit)
{       
        $answer = $input;
	while($answer >= $limit)
	{
		$answer = $answer - $limit;
	}
	return $answer;
}

function getFile($filename)
{
	$contents = file_get_contents("http://jsjbdev.github.io/world/".$filename);
	$loadedRes = explode("\n",$contents);
        return $loadedRes;
}

/* function processQueueItem()
{
	switch($taskQueue[0])
	{
		case "generateNewTownForYear":
			if(substr(baseGenerator($year),0,2)>70)
			{
				getFile("numberofcities.txt");
				$countryId = fitRecursively(substr(baseGenerator($year),1,3),235); //numerical value
				$countryId = explode(",",$loadedRes)[0]; //text value
				$countryTownCount = explode(",",$loadedRes)[1];
				getFile("countries/".$countryId.".txt");
				$town = $loadedRes[fitRecursively(substr(baseGenerator($year),2,7),(int)$countryTownCount)];
				echo($town);
			}
			else
			{
				echo("no town");
			}
			
			
	}
} */

genTownForYear();
function genTownForYear()
{
    $seed = baseGenerator($GLOBALS["cyear"]);
    if(substr($seed,0,2)>70)
    {

        $loadedRes = getFile("numberofcities.txt");

        $countryId = fitRecursively(substr($seed,1,3),235);
        $countryLine = $loadedRes[(int)$countryId];
        $countryCode = explode(",",$countryLine)[0];
        $loadedRes = getFile("countries/".$countryCode.".txt");
        $townPicked = fitRecursively(substr($seed,2,7),explode(",",$countryLine)[1]);
        $town = $loadedRes[$townPicked];
        $townSplit = explode(",",$town);
        echo($town);
        $townObject = array(
            "realName" => $townSplit[1],
            "realCountry" => $townSplit[0],
            "realRegion" => $townSplit[3],
            "latitude" => $townSplit[5],
            "longitude" => $townSplit[6],
            "townseed" => baseGenerator(222+sizeof($GLOBALS["towns"])),
            "happiness" => 100,
            "devLevel" => 100,
            "foodMod" => 5,
        );
        array_push($GLOBALS["towns"],$townObject);
        echo($townObject["realName"]);
            //this function will generate the exact same out put as "loadCityNumbers","getCountryIdFromYear","getTownsInCountryFromId","loadCountryFromID","pickTown"

    }
    else
    {
        echo("no town");
    }
    echo("<br>");
}
?>