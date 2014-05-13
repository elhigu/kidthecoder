angular.module( 'gameframe.profiles', [])

.factory('profiles', [function () {
	// slots maybe?
	var profiles = {
		'me' : { name : 'me' }, 
		'mike' : { name : 'mike' }, 
		'man' : { name : 'man' } 
	};

	return {
		list : function () {
			return _.keys(profiles);
		},
		add : function (name) {
			profiles[name] = {};
		},
		get : function (name) {
			return profiles[name];
		}
	};
}])

;