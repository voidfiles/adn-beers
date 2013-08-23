'use strict';

angular.module('yellaApp').service('Leaflet', function (ApiClient) {
  var map;
  var this_ = this;

  this.centerIcon = L.divIcon({className: 'my-div-icon'});

  this.initmap = function () {
    // set up the map
    map = new L.Map('map');
    this_.map = map;
    // create the tile layer with correct attribution
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmUrl = 'https://{s}.tiles.mapbox.com/v3/examples.map-szwdot65/{z}/{x}/{y}.png';
    var osmAttrib = 'Map data © OpenStreetMap contributors';
    var osm = new L.TileLayer(osmUrl, {minZoom: 3, maxZoom: 15, attribution: osmAttrib});
    var layer = new L.StamenTileLayer("toner-lite");
    // start the map in South-East England
    map.setView([39.50, -98.35], 5);
    // map.addLayer(layer);
    map.addLayer(osm);
    var greenIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.6.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.6.4/images/marker-shadow.png',
    });
    navigator.geolocation.getCurrentPosition(function (pos) {
      map.setView([pos.coords.latitude, pos.coords.longitude], 9);
    });
    ApiClient.get({
      url: 'posts/stream/explore/checkins?include_annotations=1'
    }).success(function (resp) {
      _.each(resp.data, function (post) {
        _.each(post.annotations, function (annotation) {
          if (annotation.type === 'net.app.core.checkin') {
            L.marker([annotation.value.latitude, annotation.value.longitude], {icon: greenIcon}).addTo(map);
          }
        });
      });
    });
  };

});