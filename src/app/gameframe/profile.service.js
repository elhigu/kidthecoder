angular.module( 'gameframe.profiles', [])

.factory('profiles', [function () {

  var baseProfile = {
    getLevelCode : function (level) {
      return 'var robot = this;\n' +
        'robot.shoot();\n' +
        'robot.turn_left(1, {\n' +
        '  DONE: function() { robot._run(robot); }\n' +
        '});\n';
    }
  };      
    
  var profiles = {
    'me' : { name : 'me' }, 
    'mike' : { name : 'mike' }, 
    'man' : { name : 'man' }
  };

  return {
    list : function () {
      return _.keys(profiles);
    },
    add : function (name) {
      profiles[name] = {};
    },
    get : function (name) {
      return _.extend(_.clone(profiles[name]), baseProfile);
    }
  };
}])

;