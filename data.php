<?php
require("phpsqlajax_dbinfo.php");

header("Content-type: text/xml");

//phpsqlajax_dbinfo.php has the following info
//$hostname="somehost";
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

function mysql_error() {
 return 'mysql execution error!';
}
// Opens a connection to a MySQL server
$mysqli= new mysqli($mysqlhost, $username, $password, $database);
if (!$mysqli) {
  die('Not connected : ' . mysql_error());
}

$sdate = isset($_GET['sdate']) ? $_GET['sdate'] : '2006-12-01';
$stime = isset($_GET['stime']) ? $_GET['stime'] : '00:00:00';

$edate = isset($_GET['edate']) ? $_GET['edate'] : '2006-12-01';
$etime = isset($_GET['etime']) ? $_GET['etime'] : '23:59:59';


$limitsjc = isset($_GET['limitsjc']) ? $_GET['limitsjc'] : 'true';

$limitsjcstring = "";
if ($limitsjc == 'true') {
  $limitsjcstring = " and ARR_APRT = 'SJC' ";
}

$interval = isset($_GET['interval']) ? $_GET['interval'] : '3';

$sdt = $sdate." ".$stime;
$edt = $edate." ".$etime;

$sdtstring = 'str_to_date("'.$sdt.'", "%Y-%m-%d %H:%i:%s")';
$edtstring = 'str_to_date("'.$edt.'", "%Y-%m-%d %H:%i:%s")';

$intervalstring = ' and mod(ID,'.$interval.') = 0 ';

echo '<root>';
// Select all the rows in the flight table
// $query = "SELECT * FROM F2006 limit 100";
$query = "select * from F2006 
  where DATE_TIME_UTC >= ".$sdtstring .
  " and DATE_TIME_UTC <= ".$edtstring . 
  $intervalstring . $limitsjcstring .
  " order by  FLIGHT_INDEX,DATE_TIME_UTC ";

//echo $query;

$result = $mysqli->query($query);
if (!$result) {
  die('Invalid query: ' . mysql_error());
}

echo '<sql statement="hello">'.parseToXML($query).'</sql>';


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
echo '</root>';

?>

