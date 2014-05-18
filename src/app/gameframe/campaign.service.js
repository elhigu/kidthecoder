/**
 * This service takes care of storing game / campaign state  and how
 * it advances
 */
angular.module( 'gameframe.campaigns', ['gameframe.levels'])

.factory('campaigns', ['levels', function (levels) {
	// TODO: create data-model of campaign...
	var testLevels = [
		{ 
			name : "level 1",
			game : "robot",
			configuration : {}
		},
		{ 
			name : "level 2",
			game : "robot",
			configuration : {}
		}
	];

	var campaign = {
		name: "The only one.",
		levels : _.pluck(testLevels, 'name')
	};

	return {
		list : function (profile) {
			return ['one', 'two', 'three'];
		}
	};
}])

;