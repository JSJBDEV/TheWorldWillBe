<?php
$cyear = htmlspecialchars($_GET["year"]);
$towns = [];
$countries = array();
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
        $answer = (int)$input;
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
        $GLOBALS["towns"][$townSplit[1]] = array(
            "realName" => str_replace("'","`",$townSplit[1]),
            "realCountry" => $townSplit[0],
            "foundedYear" => $GLOBALS["cyear"],
            "realRegion" => $townSplit[3],
            "latitude" => $townSplit[5],
            "longitude" => $townSplit[6],
            "townseed" => baseGenerator(222+sizeof($GLOBALS["towns"])),
            "happiness" => 100,
            "devLevel" => 100,
            "population" => 1,
            "foodMod" => 5,
            "resources" => substr(baseGenerator(222+sizeof($GLOBALS["towns"])),4,2),
            "branchedFrom" => "N/A",
            "partOf" => str_replace("'","`",$townSplit[1])
        );
        echo(end($GLOBALS["towns"])["realName"]);
      	
        //this function will generate the exact same out put as "loadCityNumbers","getCountryIdFromYear","getTownsInCountryFromId","loadCountryFromID","pickTown"

    }
    else
    {
        echo("no town");
    }
    echo("<br>");
}

function genBranchTown(&$parent)
{
    $seed = baseGenerator($GLOBALS["cyear"]);
    $loadedRes = getFile("countries/".$parent["realCountry"].".txt");
    $region = array_filter($loadedRes,function($line) use ($parent)
            {
                if(explode(",",$line)[3] == $parent["realRegion"])
                {
                    return true;
                }
                else{return false;}
            });
    $townPicked = fitRecursively(substr($seed,2,7),sizeof($region));
    $town = $loadedRes[$townPicked];
    $townSplit = explode(",",$town);
    $GLOBALS["towns"][$townSplit[1]] = array(
            "realName" => str_replace("'","`",$townSplit[1]),
            "realCountry" => $townSplit[0],
            "foundedYear" => $GLOBALS["cyear"],
            "realRegion" => $townSplit[3],
            "latitude" => $townSplit[5],
            "longitude" => $townSplit[6],
            "townseed" => baseGenerator(222+sizeof($GLOBALS["towns"])),
            "happiness" => 100,
            "devLevel" => 100,
            "foodMod" => 5,
            "population" => 1,
            "resources" => substr(baseGenerator(222+sizeof($GLOBALS["towns"])),4,2),
            "branchedFrom" => $parent["realName"],
            "partOf" => $parent["partOf"]
        );
    $parent["resources"] = $parent["resources"] + $GLOBALS["towns"][$townSplit[1]]["resources"];
    echo($parent["realName"]."(((".$parent["resources"].")))");
}
function townIterate()
{
    foreach($GLOBALS["towns"] as &$town)
    {
    	$ratioseed = fmod($town["townseed"],baseGenerator($GLOBALS["cyear"]));
      	$town["foodMod"] = substr($ratioseed,1,1)+1;
        if($town["branchedFrom"] != "N/A")
        {
            $parentTown = &$GLOBALS["towns"][$town["partOf"]];
        }
        else{$parentTown = &$town;}    
        if($town["foodMod"] == 2 || $town["foodMod"] == 3)
        {
                $parentTown["resources"] = $parentTown["resources"] - 1;
        }
        if($town["foodMod"] == 1)
        {
                $parentTown["resources"] = $parentTown["resources"] - 2;
        }
        if($town["foodMod"] == 8 || $town["foodMod"] == 9)
        {
                $parentTown["resources"] = $parentTown["resources"] + 1;
        }
        if($town["foodMod"] == 10)
        {
                $parentTown["resources"] = $parentTown["resources"] + 2;
        }
        
      	
        $town["population"] = $town["population"] + floor((substr($town["townseed"],1,1)*($GLOBALS["cyear"]-$town["foundedYear"])+1)/2);
        
	$town["devLevel"] = $town["devLevel"] + (int)substr(baseGenerator($GLOBALS["cyear"]),2,2) + floor(0.1*substr($town["townseed"]),1,2);
        
        
      	if(substr($ratioseed,3,2) >= 50)
        {
          	$town["happiness"]++;
        }
      	else
      	{
          	$town["happiness"]--;
      	}
      	if($town["devLevel"] < $GLOBALS["towns"][$town["partOf"]]["devLevel"]/2)
        {
          	$GLOBALS["towns"][$town["partOf"]]["resources"]--;
        }
        if($town["resources"]<0)
        {
          	removeAll($town["partOf"]);
                echo($town["realName"]." has Fallen");
        }
        if($town["population"]>$town["devLevel"])
        {
            genBranchTown($town);
            $town["population"] = floor($town["population"]/2);
        }
      	
        
    }

}
function doYears()
{
  	for($z = 0; $z<htmlspecialchars($_GET["years"]); $z++)
    {
        genTownForYear();
        townIterate();
        $GLOBALS["cyear"] = $GLOBALS["cyear"]+1;
        
    }
    
}
function removeAll($value)
{
  	foreach($GLOBALS["towns"] as $aTown)
    {
      if($aTown["partOf"] == $value)
      {
        	unset($GLOBALS["towns"][$aTown["realName"]]);
      }
    }
}
doYears();
?>