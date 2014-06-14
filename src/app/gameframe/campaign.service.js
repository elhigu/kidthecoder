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
		load : function (level) {
			var levelConf = _.find(testLevels, { name: level});
			return engines.load(levelConf);
		}
	};

	var campaignDb = [campaign];

	return {
		// list campaigns available for profile
		list : function (profile) {
			return _.map(campaignDb, function (camp) { return camp.name(); });
		},
		load : function (campaign) {
			return _.find(campaignDb, function (camp) {
				return camp.name() == campaign;
			});
		}
	};
}])

;