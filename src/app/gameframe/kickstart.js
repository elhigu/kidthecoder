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
    views: {
      "main": {
        templateUrl: 'gameframe/tpl/start.layout.tpl.html',
        controller: 'KickstartBaseCtrl'
      }
    }
  })
  
  .state('kickstart.profile', {
    url: '/',
    views : {
      "profileList" : {
        templateUrl : 'gameframe/tpl/start.profile.list.tpl.html',
        controller : 'KickstartProfileCtrl'
      }
    } 
  })

  .state('kickstart.profile.campaign', {
    url : 'profile/:profileId',
    views : {
      "campaignList" : {
        templateUrl : 'gameframe/tpl/start.campaign.list.tpl.html',
        controller : 'KickstartCampaignCtrl'
      }
    }
  })

  .state('kickstart.profile.campaign.level', {
    url : 'profile/:profileId/campaign/:campaignId',
    views : {
      "levelList" : {
        templateUrl : 'gameframe/tpl/start.level.list.tpl.html',
        controller : 'KickstartLevelCtrl'
      }
    }
  })

  .state('kickstart.profile.campaign.level.game', {
    url : 'campaign/:campaignId/level/:levelId',
    templateUrl : '',
    controller : 'KickstartGameLoaderCtrl'
  })

  ;

}])

.controller( 'KickstartBaseCtrl', ['$scope', '$stateParams', 'profiles', 
  function ( $scope, $stateParams, profiles ) {
    $scope.profiles = profiles.list();

    // all functions to control game area of layout
    $scope.selectLevel = function (level) {
        $scope.selectedLevel = level;
    };

    $scope.setAiCode = function (code) {
        $scope.aiCode = code;
    };

    $scope.setGameCanvas = function (canvas) {
        $scope.gameCanvas = canvas;
    };

    $scope.startLevel = function () {
        if ($scope.selectedLevel) {
            // start starts new game for canvas or if game is going on, 
            // re-starts it and earlier game will be aborted
            $scope.selectedLevel.start($scope.aiCode, $scope.gameCanvasEl[0]).win(function () {
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

.controller( 'KickstartProfileCtrl', ['$scope', '$stateParams', 'profiles', 
  function ( $scope, $stateParams, profiles ) {

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

.controller( 'KickstartCampaignCtrl', ['$scope', '$stateParams', 'campaigns', 'profiles', 
  function ( $scope, $stateParams, campaigns, profiles ) {
    var profileId = $stateParams.profileId;
    $scope.selectedProfile = profiles.get(profileId);
    $scope.campaigns = campaigns.list($scope.selectedProfile);
}])

.controller( 'KickstartLevelCtrl', ['$scope', '$stateParams', 'campaigns', 
  function ( $scope, $stateParams, campaigns ) {
    var campaignId = $stateParams.campaignId;
    $scope.selectedCampaign = campaigns.load(campaignId);
    $scope.levels = $scope.selectedCampaign.levels();
}])

.controller( 'KickstartGameLoaderCtrl', ['$scope', '$stateParams', 
  function ( $scope, $stateParams ) {
    var levelId = $stateParams.levelId;
    $scope.selectLevel($scope.selectedCampaign.load(levelId));
    $scope.setAiCode($scope.selectedProfile.getLevelCode(levelId));
}])

;

