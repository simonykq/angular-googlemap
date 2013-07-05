(function(){
  var app = angular.module("myApp", ["ui"]);

  app.factory('debounce', function($timeout, $q) {
  return function(func, wait, immediate) {
    var timeout;
    var deferred = $q.defer();
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if(!immediate) {
          deferred.resolve(func.apply(context, args));
          deferred = $q.defer();
        }
      };
      var callNow = immediate && !timeout;
      if ( timeout ) {
        $timeout.cancel(timeout);
      }
      timeout = $timeout(later, wait);
      if (callNow) {
        deferred.resolve(func.apply(context,args));
        deferred = $q.defer();
      }
      return deferred.promise;
    };
  };
});

  app.controller('MapCtrl', function($scope,$window, debounce){

    $scope.$watch('myMap', function(){
      $scope.marker.setMap($scope.myMap); 
    });
    $scope.$watch('search', function(v){
      debounce(
        $scope.geocoder.geocode({'address': v}, function(results,status){
          if (status == google.maps.GeocoderStatus.OK){
            $scope.setLocation(results)
            $scope.myMap.panTo(results[0].geometry.location);
            $scope.marker.setPosition(results[0].geometry.location);
          }
          else{
            console.log("Geocode fails")
          }
        }),
        1000,
        false)
    });
    $scope.geolocationAvailable = navigator.geolocation ? true : false;
    $scope.address = {
      street_address: "",
      sublocality: "",
      locality: "",
      administrative_area: "",
      country: "",
      postal_code: ""
    }
    $scope.geocoder = new google.maps.Geocoder();
    $scope.marker = new google.maps.Marker({
      draggable: true,
      position: new google.maps.LatLng(0, 0)
    });
    $scope.mapOptions = {
      center: new google.maps.LatLng(0, 0),
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    google.maps.event.addListener($scope.marker, 'dragend', function(event){
      $scope.geocoder.geocode({'latLng': event.latLng},function(results,status){
         if(status == google.maps.GeocoderStatus.OK){
           $scope.setLocation(results);      
         }
         else{
           console.log("Geocode fails")
         }
      });
    });

    $scope.setLocation = function(results){
      comps = results[0].address_components;
      street_address = [];
      administrative_area = [];
      angular.forEach(comps,function(com){
        switch(com.types[0]){
          case "street_number":
            console.log('street_number', com);
            street_address.push(com.long_name);
          case "route":
            console.log('route', com);
            street_address.push(com.long_name);             
          case "street_address":
            console.log('street_address', com);
            // street_address.push(com.long_name);
            $scope.address.street_address = com.long_name;
            break;
          case "sublocality":
            console.log('sublocality', com);
            $scope.address.sublocality = com.long_name;
          case "locality":  
            console.log('locality', com);
            $scope.address.locality = com.long_name;
          case "administrative_area_level_3":
            console.log('administrative_area_3', com);
            administrative_area.push(com.long_name);
            break;   
          case "administrative_area_level_2":
            console.log('administrative_area_2', com);
            administrative_area.push(com.long_name);
            break;    
          case "administrative_area_level_1":
            console.log('administrative_area_1', com);
            administrative_area.push(com.long_name);
            break;   
          case "country":
            console.log("country", com);
            $scope.address.country = com.long_name;
            break;
          case "postal_code":
            console.log("postal_code", com);
            $scope.address.postal_code = com.long_name;  
            break;
          default:
            console.log("unknown", com);     

        }
      });
      if(administrative_area.length !== 0){
        $scope.address.administrative_area = administrative_area.join(','); 
      }
      if(street_address.length !== 0){
        $scope.address.street_address = street_address.join(',');  
      }
      
    }

    $scope.geolocate = function(){
      addresses = [];
      angular.forEach($scope.address,function(v,k){
        if(v !== ''){
          addresses.push(v);
        }
      });
      // console.log(addresses.join(','))
      $scope.geocoder.geocode({'address': addresses.join(',')},function(results,status){
        if(status == google.maps.GeocoderStatus.OK){
          $scope.myMap.panTo(results[0].geometry.location);
          $scope.marker.setPosition(results[0].geometry.location);        
        }
        else{
          console.log("Geocode fails")
        }
      });
    }
    
    // Enable the visual refresh
    google.maps.visualRefresh = true;

    // Set the users' geolocation on the map
    $window.navigator.geolocation.getCurrentPosition(function(position){
      if($scope.geolocationAvailable){
        $scope.myMap.panTo(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
        $scope.marker.setPosition(new google.maps.LatLng(position.coords.latitude,position.coords.longitude))
        // $scope.$apply();
      }
   
    });

  });
}());
