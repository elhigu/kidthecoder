angular.module( 'appMain', [
  'templates-app',
  'templates-common',
  'app.home',
  'gameframe.kickstart',
  'ui.router.state',
  'ui.router'
])

.config( ['$stateProvider', '$urlRouterProvider', function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/' );
}])

.run( function run () {
})

.controller( 'AppCtrl', [ '$scope', '$location', function AppCtrl ( $scope, $location ) {
}])

;

