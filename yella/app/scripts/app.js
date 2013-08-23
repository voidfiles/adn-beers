'use strict';
var yella = angular.module('yellaApp', ['adn']);
yella.config(function ($routeProvider, $locationProvider, ADNConfigProvider) {

  $routeProvider.when('/beer/:post_id/', {
    templateUrl: '/views/post_detail.html',
    controller: 'PostDetailCtrl'
  });

  $routeProvider.when('/', {
    templateUrl: '/views/main.html',
    controller: 'MainCtrl'
  });

  $routeProvider.otherwise({
    redirectTo: '/'
  });

  $locationProvider.hashPrefix('#');
  $locationProvider.html5Mode(true);

  ADNConfigProvider.setConfig({
    api_client_root: 'https://alpha-api.app.net/stream/0/'
  });
});

yella.run(function ($rootScope, $location, ADNConfig, Auth) {
  // Developers should change this client_id to their own app.
  $rootScope.client_id = '7xSu3a32vnSPzDmuMEcdLnNwkwVELDCB';
  $rootScope.redirect_uri = window.location.origin;
  Auth.login();
  console.log('yoyooyoy');
});