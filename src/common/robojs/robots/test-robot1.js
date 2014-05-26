angular.module( 'robojs.test-robot1', [])

.config(['$provide', function($provide) {
    $provide.value('TestBot1', {
		run : function() {
			// console.log("=============== Testbot1 run!");
			var robot = this;
			robot.shoot();
			robot.turn_left(5, {
				DONE: function() { robot._run(robot); }
			});
		}
	});
}])
;
