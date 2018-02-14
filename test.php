<?php
$mysqlhost="cv5286.myfoscam.org";
#$mysqlhost="localhost";
$username="dbuser";
$password="dbuser";
$database="flightdb";
$db_connection = pg_connect("host=".$mysqlhost." dbname=".$database." user=".$username." password=".$password);

?>
