angular.module( 'robojs.scan-robot', [] )

.config(['$provide', function($provide) {
    $provide.value('ScanBot', {
		run : function() {
			var robot = this;
			console.log("Started run for", robot.id);

			robot.shoot();
			
			robot.turn_turret_right(45);
			robot.move_forward(Math.random()*400, {
				DONE: function() {
					robot.shoot();
					robot.turn_right(Math.random()*90, {
						DONE: function() {
							robot.shoot();
							console.log("Calling run from:", robot.id);
							robot._run(robot);
						}
					}); 
				},
				ENEMY_COLLIDE: function() {
					robot.shoot();
					robot.move_backward(100, {
						DONE: function() {
							console.log("Calling run from:", robot.id);
							robot._run(robot);
						},
						WALL_COLLIDE: function() {
							console.log("Calling run from:", robot.id);
							robot._run(robot);
						}
					});
				},
				WALL_COLLIDE: function() {
					robot.turn_left(180, {
						DONE: function() {
							robot.shoot();
							console.log("Calling run from:", robot.id);
							robot._run(robot);
						}
					});
				}
			});
		}
	});
}])

;
