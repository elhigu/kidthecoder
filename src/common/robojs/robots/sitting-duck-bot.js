angular.module( 'robojs.sitting-duck-robot', [])

.config(['$provide', function($provide) {
    $provide.value('SittingDuckBot', {
		run : function() {
			console.log("=============== Sitter run!");
			var robot = this;
			robot.turn_left(1);
			robot.move_forward(1);
			robot.turn_turret_right(1);
			robot.turn_radar_left(2, {
				DONE: function() { robot._run(robot); }
			});
		}
	});
}])
;
