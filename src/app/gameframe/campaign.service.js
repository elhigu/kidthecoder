/**
 * This service takes care of storing game / campaign state  and how
 * it advances
 */
angular.module( 'gameframe.campaigns', ['gameframe.levels'])

.factory('campaigns', ['levels', function (levels) {
	// TODO: create data-model of campaign...

	return {
		list : function (profile) {
			return ['one', 'two', 'three'];
		}
	};
}])

;