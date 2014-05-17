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
		// TODO: don't allow removing selectedProfile...
		profiles.remove(name);
	};

	/**
	 * Select profile related callbacks
	 */ 
	$scope.selectProfile = function (name) {
		$scope.selectedProfile = profiles.get(name);
	};
	$scope.logOut = function () {
		$scope.selectedProfile = null;
	};
	$scope.$watch('selectedProfile', function () {
		$scope.campaigns = campaigns.list($scope.selectedProfile);
	});

	/**
	 * Select campaign related callbacks
	 */ 
	$scope.selectCampaign = function (campaign) {
		$scope.selectedCampaign = campaign;
	};
	$scope.$watch('selectedCampaign', function () {
		$scope.levels = $scope.selectedCampaign.levels();
	});

	/**
	 * Start / end level etc.
	 */
	$scope.selectLevel = function (level) {
		$scope.selectedLevel = level;
		$scope.aiCode = $scope.selectedProfile.getLevelCode(level);
	};
	$scope.startLevel = function () {
		// start starts new game for canvas or if game is going on, 
		// re-starts it and earlier game will be aborted
		$scope.selectedGame.start($scope.aiCode, $scope.gameCanvas).win(function () {
			console.log("You won!");
		}).lose(function() {
			console.log("You lose!");
		}).abort(function () {
			console.log("Aborted game.");
		});
	};
	$scope.stopLevel = function () {
		$scope.selectedGame.stop();
	};

	// restart game if code is changed
	$scope.$watch('aiCode', function (newVal) {
		if (_.isStr(newVal) && newVal.trim().length > 0) {
			$scope.startGame();
		}
	});
}])

;

