'use strict';

angular.module('yellaApp').controller('MainCtrl', function ($rootScope, $scope, $http, ApiClient, Leaflet, $location) {
  Leaflet.initmap();
  var marker;
  Leaflet.map.on('click', function (e) {
    if (marker) {
      console.log('updating', marker.update(e.latlng));
      marker.setLatLng(e.latlng);
    } else {
      marker = L.marker(e.latlng, {icon: Leaflet.centerIcon}).addTo(Leaflet.map);
    }
    $scope.$apply(function () {
      $scope.current_location = e.latlng;
    });
  });
  $scope.beer = null;

  $scope.removeBeer = function () {
    $scope.beer = null;
    return false;
  };

  var initTypeAhead = function () {
    // multiple datasets
    jQuery('input.typeahead-beer').typeahead([{
      name: 'beers',
      remote: {
        url: '/api-proxy/search/beer?q=%QUERY',
        filter: function (data) {
          return _.map(data.response.beers.items, function (val) {
            var img = '<img class="media-object" width="45px" height="45px" src="' + val.beer.beer_label + '">';
            var pull_right = '<span class="pull-right">' + img + '</span>';
            var media_body = '<div class="media-body"><h4 class="media-heading">' + val.beer.beer_name + '</h4>' + val.brewery.brewery_name + '</div>';
            var media = '<div class="media beer-body">' + pull_right + media_body + '</div>';
            val.value = media;
            return val;
          });
        }
      }
    }]);

    jQuery('input.typeahead-beer').on('typeahead:selected', function (e, datum) {
      $scope.$apply(function () {
        $scope.beer = datum;
        console.log(datum);
      });
    });

    // multiple datasets
    jQuery('input.typeahead-location').typeahead([{
      name: 'location',
      remote: {
        url: 'https://alpha-api.app.net/stream/0/places/search?q=%QUERY',
        maxParallelRequests: 2,
        replace: function (url, uriEncodedQuery) {
          var center = Leaflet.map.getCenter();
          var bounds = Leaflet.map.getBounds();

          center = $scope.current_location || center;

          var params = {
            access_token: $rootScope.local.accessToken,
            latitude: center.lat,
            longitude: center.lng,
            radius: 1000
          };

          return 'https://alpha-api.app.net/stream/0/places/search?' + jQuery.param(params) + '&q=' + uriEncodedQuery;
        },
        filter: function (data) {
          console.log(data);
          return _.map(data.data, function (val) {
            var city = val.locality;
            var state = val.region;
            var area = '';
            if (city) {
              area = city + ', ';
            }
            if (state) {
              area = area + state;
            }
            val.value = '<h4 class="media-heading">' + val.name + '</h4>' + area;
            return val;
          });
        }
      }
    }]);

    jQuery('input.typeahead-location').on('typeahead:selected', function (e, datum) {
      $scope.$apply(function () {
        $scope.location = datum;
      });
    });

  };

  initTypeAhead();

  $scope.checkin = function () {
    $http.get('/api-proxy/beer/info/' + $scope.beer.beer.bid).success(function (resp) {
      $scope.media = resp.response.beer.media.items;
      console.log($scope.media);
      jQuery('[data-image-picker]').modal('show');
    });
  };

  $scope.selectImage = function (image) {
    jQuery('[data-image-picker]').modal('hide');

    var message = {
      text: 'A ' + $scope.beer.beer.beer_name + ' @ ' + $scope.location.name,
      annotations: [{
        type: 'net.app.food',
        value: {
          name: $scope.beer.beer.beer_name,
          vendor: $scope.beer.brewery.brewery_name,
          thumbnail_image: $scope.beer.beer_label,
          thumbnail_width: '100',
          thumbnail_height: '100'
        }
      },{
        type: 'net.app.core.oembed',
        value: {
          version: '1.0',
          type: 'photo',
          width: 640,
          height: 640,
          title: $scope.beer.beer.beer_name,
          thumbnail_url: image.photo.photo_img_lg,
          thumbnail_width: 640,
          thumbnail_height: 640,
          url: image.photo.photo_img_lg,
          embeddable_url: 'https://adn-beers.appspot.com/beer/{post_id}/'
        }
      },{
        type: 'net.app.core.checkin',
        value: {
          '+net.app.core.place': {
            factual_id: $scope.location.factual_id
          }
        }
      }]
    };
    var post_message = _.extend({}, message);
    post_message.text = post_message.text + ' — https://adn-beers.appspot.com/beer/{post_id}/';
    ApiClient.post({
      url: 'posts',
      headers: {
        'Content-Type': 'application/json'
      },
      data: angular.toJson(post_message),
    }).success(function (resp) {
      if ($scope.use_ohai_journal) {
        var message_message = _.extend({}, message);
        message_message.text = message_message.text + ' - ' + resp.data.canonical_url;
        message_message.annotations[1].value.embeddable_url = resp.data.canonical_url;
        ApiClient.post({
          url: 'channels/' + $scope.ohai_journal.id + '/messages',
          headers: {
            'Content-Type': 'application/json'
          },
          data: angular.toJson(message_message),
        }).success(function () {
          delete $scope.location;
          delete $scope.beer;
          jQuery('.typeahead-beer').val('');
          jQuery('.typeahead-location').val('');
          window.setTimeout(function () {
            $location.path('/beer/' + resp.data.id + '/');
          }, 200);
          
        });
      } else {
        delete $scope.location;
        delete $scope.beer;
        jQuery('.typeahead-beer').val('');
        jQuery('.typeahead-location').val('');
        $location.path('/beer/' + resp.data.id + '/');
        window.setTimeout(function () {
          $location.path('/beer/' + resp.data.id + '/');
        }, 200);
      }
    });

  };

  ApiClient.get({
    url: 'users/me/channels',
    params: {
      'channel_types': 'net.app.ohai.journal'
    }
  }).success(function (data) {
    console.log(data);
    var your_channel;
    _.each(data.data, function (channel) {
      if (channel.writers.you && channel.writers.immutable && channel.writers.user_ids.length === 0) {
        your_channel = channel;
      }
    });
    $scope.ohai_journal = your_channel;
  });

  /*$scope.$watch('beer', function () {
      if ($scope.beer) {
          jQuery('.beer-checkin').css('height', '330px').css('margin-top', '-165px');
      } else {
          jQuery('.beer-checkin').css('height', null).css('margin-top', null);
      }
  });*/


});