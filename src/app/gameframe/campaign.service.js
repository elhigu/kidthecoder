/**
 * This service takes care of storing game / campaign state  and how
 * it advances
 */
angular.module( 'gameframe.campaigns', ['gameframe.engines'])

.factory('campaigns', ['engines', function (engines) {
	
	var testLevels = [
		{ 
			name : "level 1",
			engine : "robot",
			configuration : {
				robots : ['SittingDuckBot']
			},
			available : true 
		},
		{ 
			name : "level 2",
			engine : "robot",
			configuration : {
				robots : ['TestBot1']				
			},
			available : false
		},
		{ 
			name : "level 3",
			engine : "robot",
			configuration : {
				robots : ['TestBot1','TestBot2','ScanBot']				
			},
			available : false
		}
	];

	var campaign = {
		name: function () { 
			return "The only one.";
		},
		levels : function () {
			var availableLevels = _.pluck(_.filter(testLevels, { available : true }), 'name');
			console.log("Getting level names:", availableLevels);
			return availableLevels;
		},
		loadLevel : function (level) {
			var levelConf = _.find(testLevels, { name: level });
			this.loadedLevel = engines.load(levelConf);
			return !!this.loadedLevel;
		},
		getLevelCode : function () {
			// not sure if it should be stored in profile at all...
			return this.profile.getLevelCode(this.loadedLevel);
		},
		trySolution : function (code, canvas, winCb, loseCb) {
			var self = this;
			self.loadedLevel.start(code, canvas)
			.win(function () {

				// TODO: unlock next nodes in campaign story graph...

				winCb({
					points: 100,
					stars: 3
				});
			})
			.lose(function () {
				loseCb();
			});
		}
	};

	var campaignDb = [campaign];

	return {
		// list campaigns available for profile
		list : function (profile) {
			return _.map(campaignDb, function (camp) { return camp.name(); });
		},
		load : function (profile, campaign) {
			// fast hack for now
			var c =  _.find(campaignDb, function (camp) {
				return camp.name() == campaign;
			});
			c.profile = profile;
			return c;
		}
	};
}])

;