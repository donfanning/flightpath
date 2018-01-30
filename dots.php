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
$mysqli= new mysqli('localhost', $username, $password, $database);
if (!$mysqli) {
  die('Not connected : ' . mysql_error());
}

// Select all the rows in the markers table
// $query = "SELECT * FROM F2006 limit 100";
$query = "select * from F2006 where DATE_TIME_UTC > '2006-12-10' and DATE_TIME_UTC < '2006-12-11' order by  FLIGHT_INDEX,DATE_TIME_UTC  limit 100";

$result = $mysqli->query($query);
if (!$result) {
  die('Invalid query: ' . mysql_error());
}

header("Content-type: text/xml");
$lastFlight = "null";
// Start XML file, echo parent node
echo "<markers>\r\n";

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
    echo '<flight> ';
  }
  echo '<marker ';
  echo 'flight="' . parseToXML($row['AIRCRAFT_ID']) . '" ';
  
  echo 'lat="' . $row['LATITUDE'] . '" ';
  echo 'lng="' . $row['LONGITUDE'] . '" ';
  echo 'id="' . $row['ID'] . '" ';
  echo "/>\r\n";
}

// last closing flight
if($lastFlight != 'null') {
  // close marker
  echo "</flight>\r\n";
}

// End XML file
echo '</markers>';

?>

