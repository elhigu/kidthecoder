angular.module( 'gameframe.kickstart', [
    'ui.router',
    'gameframe.campaigns',
    'gameframe.profiles',
    'common.ng-scope-element'
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
        templateUrl: 'gameframe/tpl/start.profile.tpl.html',
        controller: 'KickstartProfileCtrl'
      }
    }
  })
  .state('kickstart.profile', {
    url : 'profile/:profileId',
    templateUrl : 'gameframe/tpl/start.campaign.tpl.html',
    controller : 'KickstartCampaignCtrl'
  });
}])

/**
 * And of course we define a controller for our route.
 */
.controller( 'KickstartProfileCtrl', ['$scope', '$stateParams', 'profiles', function ( $scope, $stateParams, profiles ) {
    $scope.profiles = profiles.list();

    $scope.addProfile = function (name) { 
        profiles.add(name);
    };
    $scope.deleteProfile = function (name) {
        // TODO: don't allow removing selectedProfile...
        profiles.remove(name);
    };

    $scope.logOut = function () {
        $scope.selectedProfile = null;
    };
}])

.controller( 'KickstartCampaignCtrl', ['$scope', '$stateParams', 'campaigns', function ( $scope, $stateParams, campaigns ) {
    var profileId = $stateParams.profileId;
    $scope.selectedProfile = profiles.get(profileId);
    $scope.campaigns = campaigns.list($scope.selectedProfile);

    /**
     * Select campaign related callbacks
     */ 
    $scope.selectCampaign = function (campaign) {
        $scope.selectedCampaign = campaigns.load(campaign);
    };
    $scope.$watch('selectedCampaign', function () {
        if ($scope.selectedCampaign) {
            $scope.levels = $scope.selectedCampaign.levels();
        }
    });

    /**
     * Start / end level etc.
     */
    $scope.selectLevel = function (level) {
        $scope.selectedLevel = $scope.selectedCampaign.load(level);
        $scope.aiCode = $scope.selectedProfile.getLevelCode(level);
    };

    $scope.startLevel = function () {
        if ($scope.selectedLevel) {
            // start starts new game for canvas or if game is going on, 
            // re-starts it and earlier game will be aborted
            $scope.selectedLevel.start($scope.aiCode, $scope.gameCanvas[0]).win(function () {
                console.log("You won!");
            }).lose(function() {
                console.log("You lose!");
            }).abort(function () {
                console.log("Aborted game.");
            });
        }
    };
    $scope.stopLevel = function () {
        $scope.selectedLevel.stop();
    };

    // restart game if code is changed
    $scope.$watch('aiCode', function (newVal) {     
        $scope.startLevel();
    });
}])

;

