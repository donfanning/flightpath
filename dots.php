<?php
require("phpsqlajax_dbinfo.php");

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
$query = "SELECT * FROM F2006 limit 10";
//DATE_TIME_UTC>=DATE('2016-12-01') AND DATE_TIME_UTC<DATE('2016-12-02') ";
$result = $mysqli->query($query);
if (!$result) {
  die('Invalid query: ' . mysql_error());
}

header("Content-type: text/xml");

// Start XML file, echo parent node
echo '<markers>';

// Iterate through the rows, printing XML nodes for each
while ($row = mysqli_fetch_assoc($result)){
  // Add to XML document node
  echo '<marker ';
  echo 'flight="' . parseToXML($row['AIRCRAFT_ID']) . '" ';
  echo 'lat="' . $row['LATITUDE'] . '" ';
  echo 'lng="' . $row['LONGITUDE'] . '" ';
  echo 'id="' . $row['ID'] . '" ';
  echo '/>';
}

// End XML file
echo '</markers>';

?>

