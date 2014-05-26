angular.module( 'robojs.test-robot2', [])

.config(['$provide', function($provide) {
    $provide.value('TestBot2', {
		run : function() {
			// console.log("=============== Testbot2 run!");
			var robot = this;
			robot.turn_turret_right(90);
			robot.move_forward(parseInt(Math.random()*robot.arena_width), {
				DONE: function() {
					robot.shoot();
					robot.turn_turret_left(90);
					robot.turn_right(90, {
						DONE: function() {
							robot._run(robot);
						}
					});
				}		
			});
		}
	});
}])
;

