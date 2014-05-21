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
			}
		},
		{ 
			name : "level 2",
			engine : "robot",
			configuration : {
				robots : ['TestBot1']				
			}
		},
		{ 
			name : "level 3",
			engine : "robot",
			configuration : {
				robots : ['TestBot1','TestBot2','ScanBot']				
			}
		}
	];

	var campaign = {
		name: function () { 
			return "The only one.";
		},
		levels : function () {
			console.log("Getting level names:", _.pluck(testLevels, 'name'));
			return _.pluck(testLevels, 'name');
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