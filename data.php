<?php
require("phpsqlajax_dbinfo.php");

//phpsqlajax_dbinfo.php has the following info

//$username="somedbuser";
//$password="somedbuser";
//$database="somedb";


function parseToXML($htmlStr)
{
$xmlStr=str_replace('<','&lt;',$htmlStr);
$xmlStr=str_replace('>','&gt;',$xmlStr);
$xmlStr=str_replace('"','&quot;',$xmlStr);
$xmlStr=str_replace("'",'&#39;',$xmlStr);
$xmlStr=str_replace("&",'&amp;',$xmlStr);
return $xmlStr;
}

// Opens a connection to a MySQL server
$mysqli= new mysqli($mysqlhost, $username, $password, $database);
if (!$mysqli) {
  die('Not connected : ' . mysql_error());
}

// Select all the rows in the flight table
// $query = "SELECT * FROM F2006 limit 100";
$query = "select * from F2006 
  where DATE_TIME_UTC > '2006-12-10' 
  and DATE_TIME_UTC < '2006-12-11' 
  and mod(ID,5) = 0 
  and ARR_APRT = 'SJC'
  order by  FLIGHT_INDEX,DATE_TIME_UTC ";

$query = "select * from F2006
  where ID < 1000
  and mod(ID,5) = 0
  order by  FLIGHT_INDEX,DATE_TIME_UTC ";

$result = $mysqli->query($query);
if (!$result) {
  die('Invalid query: ' . mysql_error());
}

header("Content-type: text/xml");
$lastFlight = "null";
// Start XML file, echo parent node
echo "<flights>\r\n";

// Iterate through the rows, printing XML nodes for each
while ($row = mysqli_fetch_assoc($result)){
  // check if we need to create a new path
  // Add to XML document node
  if ($lastFlight != $row['FLIGHT_INDEX']) {
     if($lastFlight != 'null') {
       // close flight
       echo "</flight>\r\n";
     }
    $lastFlight = $row['FLIGHT_INDEX'];
     // start a new marker
    echo '<flight ';
    echo 'name="' .$row['AIRCRAFT_ID'] .'" ';
    echo 'src="' .$row['DEP_APRT'] .'" ';
    echo 'des="' .$row['ARR_APRT'] .'" ';
    echo 'index="' . $row['FLIGHT_INDEX'] .'">';
  }
  echo '<marker ';
  echo 'lat="' . $row['LATITUDE'] . '" ';
  echo 'lng="' . $row['LONGITUDE'] . '" ';
  echo 'altx100ft="' . $row['ALTITUDEx100ft'] . '" ';
  echo 'datetimeutc="' . $row['DATE_TIME_UTC'] . '"';
  echo "/>\r\n";
}

// last closing flight
if($lastFlight != 'null') {
  // close marker
  echo "</flight>\r\n";
}

// End XML file
echo '</flights>';

?>

