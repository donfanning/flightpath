      var map;
      var flightPlanCoordinates = [];

      /* <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDFtc8Ix25xIykMtvbSMBFkxZnW0Z19Wdw&callback=initMap" async defer></script>*/

      // load google map script
      var gmap = document.createElement('script');
      gmap.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDFtc8Ix25xIykMtvbSMBFkxZnW0Z19Wdw&callback=initMap';
      gmap.async = true;
      gmap.defer = true;
      document.head.appendChild(gmap);

      // call back after google map script is loaded
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 37.343111, lng: -122.042324},
          zoom: 11
        });
        infoWindow = new google.maps.InfoWindow;
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            //infoWindow.setPosition(pos);
            //infoWindow.setContent('Your Location Found.'+pos.lat+','+pos.lng);
            //infoWindow.open(map);
            //map.setCenter(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
        //https://somehost.dns.name/somedirectory
        hostAddress= top.location.href.toString(); 
        downloadUrl(hostAddress+'/data.php',
            function(data, status)  { 
              var xml = data.responseXML;
              var flights = xml.documentElement.getElementsByTagName('flight');
              flightPlanCoordinates = [];
              var flightName = '';
              var flightSrc = '';
              var flightDes = '';
             
              Array.prototype.forEach.call(flights, 
                function(flightElem) {
                  flightName = flightElem.getAttribute('name');
                  flightSrc = flightElem.getAttribute('src');
                  flightDes = flightElem.getAttribute('des');
                  var markers = 	flightElem.children;
                  Array.prototype.forEach.call(markers, 
                    function(markerElem) {
                      if (markerElem.nodeName == 'marker') {
                        var point = new google.maps.LatLng(
                         parseFloat(markerElem.getAttribute('lat')),
                         parseFloat(markerElem.getAttribute('lng')));
                         flightPlanCoordinates.push(point);
                         setmarker(point, markerElem.getAttribute('altx100ft'), flightName, flightSrc, flightDes);
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
                  flightPath.addListener('mouseover', function(){
                      document.getElementById('label-status').innerHTML = 'bingo!';
                  });
                  flightPath.addListener('mouseleave', function(){
                       document.getElementById('label-status').innerHTML = 'bye';
                  })
                  flightPlanCoordinates = [];
               } // func flightElem
           ); // forEach flight 
        } // func data
     ); // download call
     } //function initMap

     function setmarker(point, alt100ft, flightName, flightSrc, flightDes) {
      //test if it's close to serra park
      var serra = new google.maps.LatLng(37.3405874,-122.0521408);
      //var dist = google.maps.geometry.spherical.computeDistanceBetween (serra,point);      
       var dist = calculateDistance(serra,point);
      // meter to mile
       dist = dist * 0.000621;
       dist = dist.toPrecision(2);
      //only mark if within 6 miles
      if (dist > 6)
         return;
      var infowincontent = document.createElement('div');
      var strong = document.createElement('strong');
      strong.textContent = flightName; 
      infowincontent.appendChild(strong);
      infowincontent.appendChild(document.createElement('br'));
      var text = document.createElement('text');
      text.textContent = flightSrc + '->' + flightDes + ', altitude:' + alt100ft + '00ft' + ', dist:'+dist+
'mi';
      infowincontent.appendChild(text);
      var symbolOne = {
          path: 'M -2,0 0,-2 2,0 0,2 z',
          strokeColor: '#F00',
          fillColor: '#F00',
          fillOpacity: 0.5
      };

      var marker = new google.maps.Marker({
       map: map,
       position: point,
       icon: symbolOne
       });
       marker.addListener('mouseover', function() {
          infoWindow.setContent(infowincontent);
          infoWindow.open(map, marker);
        }); //addListener
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
