angular.module( 'gameframe.kickstart', [
	'ui.router',
	'gameframe.campaigns',
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
.controller( 'KickstartCtrl', ['$scope', 'profiles', 'campaigns', function KickstartController( $scope, profiles, campaigns ) {
	$scope.profiles = profiles.list();

	$scope.addProfile = function (name) { 
		profiles.add(name);
	};
	$scope.deleteProfile = function (name) {
		profiles.remove(name);
	};
	$scope.selectProfile = function (name) {
		$scope.selectedProfile = profiles.get(name);
	};
	$scope.logOut = function () {
		$scope.selectedProfile = null;
	};

	// if profile is selected show campaigns 
	$scope.$watch('selectedProfile', function () {
		$scope.campaigns = campaigns.list($scope.selectedProfile);
	});

}])

;

