angular.module( 'gameframe.engines', ['robojs.engine'])

.factory('engines', ['robotGame', function (robotGame) {

	var engines = {
		robot : robotGame
	};

	return { 
		load : function (levelConf) {
			console.log("Going to return game for", levelConf);
			var engine = engines[levelConf.engine];
			var conf = levelConf.configuration;
			return engine.init(conf);
		}
	};
}])

;