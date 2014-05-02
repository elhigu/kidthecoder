angular.module( 'robojs.sitting-duck-robot', [])

.config(['$provide', function($provide) {
    $provide.value('SittingDuckBot', {
		run : function() {
			console.log("=============== Sitter run!");
			var robot = this;

			robot.turn_left(20, function() {
				robot._run(robot);
			});
		}
	});
}])
;
