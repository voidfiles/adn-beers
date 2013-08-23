'use strict';

angular.module('yellaApp').controller('PostDetailCtrl', function ($scope, Leaflet, $routeParams, ApiClient) {
  console.log('yoyoyoy 1');
  Leaflet.initmap();
  console.log('yoyoyoyoyyo', $routeParams.post_id);
  ApiClient.get({
    url: '/posts/' + $routeParams.post_id,
    params: {
      include_annotations: 1,
    }
  }).success(function (blah) {
    var post = blah.data;
    _.each(post.annotations, function (obj) {
      if (obj.type === 'net.app.core.oembed') {
        $scope.oembed = obj;
      }
      $scope.post = post;

      console.log(post, $scope.oembed);
    });
  });

});