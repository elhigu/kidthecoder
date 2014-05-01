angular.module( 'robojs.base-robot', [])

.config(['$provide', function($provide) {

	// TODO: robot system would be better where you just
	//       set speed [-1.0, 1] for scanner, turret and
	//       hull rotation and events will tell where robot
	//       is at that time.
	//       callbacks tell if scanner found robot and
	//       allows to check how log is coolout period
	//       scanner could also tell exact place of seen robot
	//       (this allows to keep track of its speed etc)
	//       also global clock should be exposed and maybe 
	//       fire speed or top angle if one would like to do 3d :)

	var BaseRobot = {
		_callback_counter: 0,
		_callback_status: {},
		
		move_forward: function(distance, callback) {
			this._send({
				"signal": "MOVE",
				"distance": distance
			}, callback);
		},
		move_backward: function(distance, callback) {
			this._send({
				"signal": "MOVE",
				"distance": -distance
			}, callback);
		},
		turn_left: function(angle, callback) {
			this._send({
				"signal": "ROTATE",
				"angle": -angle
			}, callback);
		},
		turn_right: function(angle, callback) {
			this._send({
				"signal": "ROTATE",
				"angle": angle
			}, callback);
		},
		turn_turret_left: function(angle, callback) {
			this._send({
				"signal": "ROTATE_TURRET",
				"angle": -angle
			}, callback);
		},
		turn_turret_right: function(angle, callback) {
			this._send({
				"signal": "ROTATE_TURRET",
				"angle": angle
			}, callback);
		},
		turn_radar_left: function(angle, callback) {
			this._send({
				"signal": "ROTATE_RADAR",
				"angle": -angle
			}, callback);
		},
		turn_radar_right: function(angle, callback) {
			this._send({
				"signal": "ROTATE_RADAR",
				"angle": angle
			}, callback);
		},
		shoot: function() {
			this._send({
				"signal": "SHOOT"
			});
		},
		_receive: function(msg_obj) {
			switch(msg_obj["signal"]) {
				case "CALLBACK":
					var callbacks = msg_obj["callback"];				
					if(callbacks) {
						var callback = callbacks[msg_obj["status"]];
						if(callback) {
							callback();
							
						}
					}
					break;
				case "INFO":
					this.arena_width = msg_obj["arena_width"];
					this.arena_height = msg_obj["arena_height"];
					break;
				case "UPDATE":
					this.x = msg_obj["x"];
					this.y = msg_obj["y"];
					break;
				case "RUN":
					this._run(this);
					break;
			}
		},

		_send: function(msg_obj, callback) {		
			var callback_id = this._callback_counter++;
			msg_obj["callback"] = callback;			
			this.postMessage(msg_obj);
		},
	
		_run: function(robot) {
			setTimeout(function() {
				robot.run();
			}, 0);
		}
	};

    $provide.value('RobotBody', BaseRobot);
}]) 
;
