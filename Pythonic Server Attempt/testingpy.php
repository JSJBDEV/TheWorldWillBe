<?php 
echo("new page");
$output = passthru("python pygen.py");
echo($output);
?>