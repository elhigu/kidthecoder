angular.module( 'robojs.robot-db', [
	'robojs.base-robot',
	'robojs.scan-robot',
	'robojs.sitting-duck-robot',
	'robojs.test-robot1',
	'robojs.test-robot2'
	])

.factory( 'robotDb', [ '$injector', 'RobotBody', function ($injector, RobotBody) {	
	var db = {};

	// init DB with hardcoded bots
	_.each(["ScanBot", "TestBot1", "TestBot2", "SittingDuckBot"], function (name) {
		var brains = $injector.get(name);
		var robot = _.extend(_.extend({}, RobotBody), brains);
		db[name] = robot;
	});

	return {
		_db : db,

		getRobot : function(name) {
			return this._db[name];
		},

		listRobots : function () {
			console.log("Robot List", this._db);
			return _.keys(this._db);
		},

		save : function (name, code) {
			console.log("Saving to local storage not implemented..");		
			var runner = null;
			try {
				runner = new Function(code);
			} catch(e) {
				runner = null;
				console.log(e);
			}
			if (runner) {
				var brains = {
					run: runner
				};
				var robot = _.extend(_.extend({}, RobotBody), brains);
				db[name] = robot;
			}
			return runner !== null;
        }
	};
}])	
;