angular.module( 'robojs.robot-db', [
	'robojs.base-robot',
	'robojs.scan-robot'
//	'robojs.sitting-duck-robot',
//	'robojs.test-robot1',
//	'robojs.test-robot2'
	])

.factory( 'robotDb', [ '$injector', 'RobotBody', function ($injector, RobotBody) {	
	return {
		getRobot : function(name) {
			var brains = $injector.get(name);
			var robot = _.extend(_.extend({}, RobotBody), brains);
			return robot;
		},

		listRobots : function () {
			return ['a', 'b'];
		},

		save : function (name, code) {
			console.log("Saving to local storage not implemented..");
		}
	};
}])	
;