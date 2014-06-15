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

  ;

}])

.controller( 'KickstartBaseCtrl', ['$scope', '$stateParams', '$state', 'profiles', 
  function ( $scope, $stateParams, $state, profiles ) {
    $scope.profiles = profiles.list();

    $scope.selectCampaign = function (campaign) {
        $scope.selectedCampaign = campaign;
    };

    $scope.setAiCode = function (code) {
        $scope.aiCode = code;
        $scope.startLevel();
    };

    $scope.setGameCanvas = function (canvas) {
        $scope.gameCanvas = canvas;
    };

    $scope.selectLevel = function (levelId) {
      $scope.selectedCampaign.loadLevel(levelId);
    };

    $scope.startLevel = function () {
        if (!$scope.gameCanvasEl) {
          console.log("Canvas not ready! Make this work reasonably... this is a mess.");
          return;
        }

        console.log("Starting level!");

        // I really should learn to use promises efectively...
        // ... some other day, im busy now :)
        $scope.selectedCampaign.trySolution(
          $scope.aiCode, 
          $scope.gameCanvasEl[0],
          function win(results) {
            console.log("You win! Results", results);
          },
          function lose() {
            console.log("You lose, try again");
          }
        );    
    };

    $scope.stopLevel = function () {
        $scope.selectedCampaign.stop();
    };

    // restart game if code is changed
    $scope.$watch('aiCode', function (oldVal, newVal) {     
        if (oldVal != newVal) {
          $scope.startLevel();
        }
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
    $scope.selectCampaign(campaigns.load($scope.selectedProfile, campaignId));
    $scope.levels = $scope.selectedCampaign.levels();
}])

;

