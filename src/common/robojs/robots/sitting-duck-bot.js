angular.module( 'robojs.sitting-duck-robot', ['robojs.base-robot'])

.config(['$provide', 'BaseRobot', function($provide, BaseRobot) {
    $provide.value('SittingDuckBot', _.extend(_.extend({}, BaseRobot), {
		run : function() {
			var robot = this;

			robot.turn_left(20, function() {
				robot._run();
			});
		}
	}))
	;
}])
;

/*
SittingDuckBot = BaseRobot;

SittingDuckBot.run = function() {
	var robot = this;

	robot.turn_left(20, function() {
		robot._run();
	});
};
*/