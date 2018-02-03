      var map;
      var flightPlanCoordinates = [];
      var flightPaths = [];
      var markers = [];
      var theData;
      var waypoints = [];
      // load google map script
      var gmap = document.createElement('script');
      gmap.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDFtc8Ix25xIykMtvbSMBFkxZnW0Z19Wdw&callback=initMap';
      gmap.async = true;
      gmap.defer = true;
      document.head.appendChild(gmap);
      //Make the DIV element draggagle:
      dragElement(document.getElementById(("option-panel")));
      dragElement(document.getElementById(("floating-panel")));
      dragElement(document.getElementById(("floating-toolbox")));

      // call back after google map script is loaded
      function initMap() {
        console.log("initMap got called");
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 37.343111, lng: -122.042324},
          zoom: 11
        });
        infoWindow = new google.maps.InfoWindow();
        infoWindowWaypoints = new google.maps.InfoWindow();
        loadWaypoints();
        drawFlightPath(map);
        loadWaypoints();

      
     } //function initMap
     function toggleWaypoints(ele) {
        console.log("showWaypoints:"+ele.checked);

        if (ele.checked) {
          console.log("showing waypoints");
          waypoints.forEach(function(marker, index, arr) {
           marker.setMap(map);
          });
        } else {
          console.log("hiding waypoints");
          markers.forEach(function(marker, index, arr) {
            marker.setMap(null);
          });
        }
     }
    function loadJSON(file, callback) {   

      var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', file, true); // Replace 'my_data' with the path to your file
      xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
      };
      xobj.send(null);  
    }
 
    function loadWaypoints() {
      loadJSON("waypoints.json", function(response) {
        var waypoints = JSON.parse(response);
        console.log(waypoints);
        waypoints.forEach(function(waypoint) {
          console.log(waypoint);
          var latLng = new google.maps.LatLng(waypoint.lat, waypoint.lng);
            // Creating a marker and putting it on the map
            var marker = new google.maps.Marker({
                position: latLng,
                title: waypoint.title
            });


          var infowincontent = document.createElement('div');
          var strong = document.createElement('strong');
          strong.textContent = waypoint.title;
          infowincontent.appendChild(strong);
          infowincontent.appendChild(document.createElement('br'));
          var text = document.createElement('text');
          text.textContent = waypoint.description;
          infowincontent.appendChild(text);
          marker.addListener('click', function() {
            infoWindowWaypoints.setContent(infowincontent);
            infoWindowWaypoints.open(map, marker);
          }); //addListener
          marker.setMap(map);
          waypoints.push(markers);

          });
      });
    }   
     //test.php?sdate=2006-12-01&stime=00:00:00&edate=2006-12-01&etime=23:59:59
     function drawFlightPath(map, datalink='data.php') {
        //https://somehost.dns.name/somedirectory
        hostAddress= top.location.href.toString(); 
        console.log("drawFlighPath got called");
        console.log(hostAddress);
        downloadUrl(hostAddress+datalink,
            function(data, status)  { 
              console.log(data.responseText);
              var xml = data.responseXML;
              theData = new XMLSerializer().serializeToString(xml);
              //save the raw xml data for viewing
              //rawtext = document.getElementById('flight-data-xml');
              //rawtext.textContent = theData;
              var flights = xml.documentElement.getElementsByTagName('flight');
              
              flightPlanCoordinates = [];
              var flightName = '';
              var flightSrc = '';
              var flightDes = '';
              var flightTime = '';
             
              Array.prototype.forEach.call(flights, 
                function(flightElem) {
                  flightName = flightElem.getAttribute('name');
                  flightSrc = flightElem.getAttribute('src');
                  flightDes = flightElem.getAttribute('des');
                  //flight time will be the last marker time where flights arrive at airports.
                  flightTime = ''; 
                  var markers = 	flightElem.children;
                  Array.prototype.forEach.call(markers, 
                    function(markerElem) {
                      if (markerElem.nodeName == 'marker') {
                        var point = new google.maps.LatLng(
                         parseFloat(markerElem.getAttribute('lat')),
                         parseFloat(markerElem.getAttribute('lng')));
                         flightTime = markerElem.getAttribute('datetimeutc');
                         flightPlanCoordinates.push(point);
                         setMarker(point, markerElem.getAttribute('altx100ft'), flightName, flightSrc, flightDes, flightTime);
                      }
                    }  // func
                  ) ; 
                  var flightPath = new google.maps.Polyline({
                    path: flightPlanCoordinates,
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.3,
                    strokeWeight: 1,
                    geodesic: true,
                  });
                  flightPath.setMap(map);
                  console.log("flight:"+flightName);
                  setFlightPath(flightPath, flightName+' ('+flightSrc+'->'+flightDes+') Arrived at '+flightTime, flightPaths.length);
                  flightPlanCoordinates = [];
                  flightPaths.push(flightPath);
               } // func flightElem
           ); // forEach flight 
        } // func data
     ); // download call

    }
     function setFlightPath(flightPath, info, index) {

      flightPath.addListener('mouseover', function(){
          document.getElementById('label-status').innerHTML = info;
      });

     }
   function setMarker(point, alt100ft, flightName, flightSrc, flightDes, time) {
      //test if it's close to serra park
      //37.343019, -122.044503
      var serra = new google.maps.LatLng(37.343019, -122.044503);
      //var dist = google.maps.geometry.spherical.computeDistanceBetween (serra,point);      
       var dist = calculateDistance(serra,point);
      // meter to mile
       dist = dist * 0.000621;
       dist = dist.toPrecision(2);
      //only mark if within 6 miles
      if (dist > 6.0)
         return;
      var info = flightName + ' (' + flightSrc + '->' + flightDes + '), Altitude:' + alt100ft + '00ft' + ', Dist:'+dist+ 'mi, ' + 'Time:'+time + ')';
      var infowincontent = document.createElement('div');
      var strong = document.createElement('strong');
      strong.textContent = flightName; 
      infowincontent.appendChild(strong);
      infowincontent.appendChild(document.createElement('br'));
      var text = document.createElement('text');
      text.textContent = flightSrc + '->' + flightDes + ', Altitude:' + alt100ft + '00ft' + ', Dist:'+dist+'mi, ' + 'Time:'+time;
      infowincontent.appendChild(text);


      var symbolOne = {
          path: 'M -1,0 0,-1 1,0 0,1 z',
          strokeColor: '#F00',
          fillColor: '#FF0',
          fillOpacity: 0.4
      };

      var marker = new google.maps.Marker({
       map: map,
       position: point,
       icon: symbolOne
       });
       marker.addListener('click', function() {
          infoWindow.setContent(infowincontent);
          infoWindow.open(map, marker);
        }); //addListener

       marker.addListener('mouseover', function() {
          document.getElementById('label-status').innerHTML = info;
        }); //addListener
       markers.push(marker);
     } 
      function downloadUrl(url, callback) {
        var request = new XMLHttpRequest;
        request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            request.onreadystatechange = doNothing;
            callback(request, request.status);
          }
        };
        request.open('GET', url, true);
        request.send(null);
      }

      function doNothing() {}

      function calculateDistance(pointA, pointB) {
        const lat1 = pointA.lat();
        const lon1 = pointA.lng();
        const lat2 = pointB.lat();
        const lon2 = pointB.lng();
        const R = 6371e3; // earth radius in meters
        const φ1 = lat1 * (Math.PI / 180);
        const φ2 = lat2 * (Math.PI / 180);
        const Δφ = (lat2 - lat1) * (Math.PI / 180);
        const Δλ = (lon2 - lon1) * (Math.PI / 180);

        const a = (Math.sin(Δφ / 2) * Math.sin(Δφ / 2)) +
            ((Math.cos(φ1) * Math.cos(φ2)) * (Math.sin(Δλ / 2) * Math.sin(Δλ / 2)));
  
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c;
        return distance; // in meters
      }
      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
      }


  function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
      /* if present, the header is where you move the DIV from:*/
      document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
      /* otherwise, move the DIV from anywhere inside the DIV:*/
      elmnt.onmousedown = dragMouseDown;
    }
  function dragMouseDown(e) {
    e = e || window.event;
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
function toggleMarkers(ele) {
  console.log("showMarkers:"+ele.checked);
  
  if (ele.checked) {
      console.log("showing markers");
      markers.forEach(function(marker, index, arr) {
         marker.setMap(map);
      });
 } else {
      console.log("hiding markers");
      markers.forEach(function(marker, index, arr) {
         marker.setMap(null);
      });
  }
}
function clearMap() {
    markers.forEach(function(marker, index, arr) {
      marker.setMap(null);
      marker = null;
    });
   markers=[];
   flightPaths.forEach(function(flight, index, arr) {
     flight.setMap(null);
     flight = null;
    });
   flightPaths=[];
}
function validateFormOnSubmit() {
    sdate = document.getElementById('starting-date').value;
    stime = document.getElementById('starting-time').value;
    edate = document.getElementById('ending-date').value;
    etime = document.getElementById('ending-time').value;
    limitsjc = document.querySelector('input[id="limit-sjc-arrivals"]');
    console.log('limit to sjc arrivals:'+limitsjc.checked);
    interval = document.getElementById('interval').value;
    console.log("interval="+interval);

    sdt = new Date(sdate+'T'+stime+'Z');
    edt = new Date(edate+'T'+etime+'Z');
    if (sdt > edt) {
      window.alert('Invalid date range, please try again!');
      return;
    }
    if (interval < 1)
      interval = 1;
    else if (interval > 10)
      interval = 10;  
    console.log("starting date: "+sdt+", ending date: "+edt);
    clearMap();    
    urlstring='data.php?sdate='+sdate+'&stime='+stime+'&edate='+edate+'&etime='+etime+'&limitsjc='+limitsjc.checked+'&interval='+interval;
    console.log(urlstring);
    drawFlightPath(map, urlstring);
    return false;
}

function showRawFlightData() {
  console.log(theData);
 window.open(theData, "", "_blank")

//  myXmlWindow.document.write('<?xml version="1.0" ?>'+theData);
}
