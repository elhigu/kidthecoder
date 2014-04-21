angular.module( 'robojs.robot-db', [])

.factory( 'robotDb', function () {	
	return {
		listRobots : function () {
			return ['a', 'b'];
		},

		save : function (name, code) {
			console.log("Saving to local storage not implemented..");
		}
	};
})	
;