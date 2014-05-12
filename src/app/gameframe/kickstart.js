angular.module( 'gameframe.kickstart', [
	'ui.router',
	'gameframe.levels',
	'gameframe.profiles'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'kickstart', {
    url: '/',
    views: {
      "main": {
        controller: 'KickstartCtrl',
        templateUrl: 'gameframe/kickstart.tpl.html'
      }
    }
  });
}])

/**
 * And of course we define a controller for our route.
 */
.controller( 'KickstartCtrl', ['$scope', 'levels', 'profiles', function KickstartController( $scope, levels, profiles ) {

}])

;

