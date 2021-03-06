angular.module( 'robojs.engine', ['robojs.robot-db'])

.factory('robotGame', ['robotDb', function (robotDb) {
    var seed = 1;
    function random() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // robot game engine is basically this function
    var robotGameEngine = function (canvas, conf) {

        var ctx = canvas.getContext("2d"); 
        var robots = [], bullets = [];
                    
        // utility functions
        var Utils = {
            degree2radian: function(a) {
                return a * (Math.PI/180); 
            },
            distance: function(x1, y1, x2, y2) {
                return Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2));
            },
            is_point_in_square: function(x1,y1, x2, y2, width, height) {
                if(
                    (x1>=x2) &&
                    (x1<=(x2+width)) &&
                    (y1>=y2) &&
                    (y1<=(y2+height))
                ) {
                    return true;
                } else {
                    return false;
                }
            }, 
        };
        
        
        var ARENA_WIDTH = canvas.width;
        var ARENA_HEIGHT = canvas.height;
        var ROBOT_SPEED = 1;
        var BULLET_SPEED = 3;
        
        var BattleManager = {
            _robots: {},
            _explosions: [],
            _ctx: null,
            _iterations: 0,

            init: function(ctx, workers, maxIterations) {
                var battle_manager = this;
                battle_manager._ctx = ctx;
                if (!maxIterations) {
                    maxIterations = 0;
                }
                battle_manager._maxIterations = maxIterations;

                var postMessage = function (robot_id, msg) {
                    battle_manager._receive(robot_id, msg);
                };

                for(var w=0; w<workers.length; w++) {
                    var robot_id = "robot-" + w;
                    var robot = {
                        "id": robot_id,
                        "x": parseInt((ARENA_WIDTH-150)*random()),
                        "y": parseInt((ARENA_HEIGHT-150)*random()),
                        "health": 50,
                        "direction": 40,
                        "turret_direction": 0,
                        "radar_direction": 0,
                        "bullet": null,
                        "events": [],
                        "worker": robotDb.getRobot(workers[w])
                    };

                    robot["worker"].postMessage = postMessage;
                    robot["worker"].id = robot_id;

                    battle_manager._robots[robot_id] = robot;
                    
                    battle_manager._send(robot_id, {
                        "signal": "INFO",
                        "arena_height": ARENA_HEIGHT,
                        "arena_width": ARENA_WIDTH
                    });
                }
            },
            
            _receive: function(robot_id, msg_obj) {
                // console.log("Robot:", robot_id, "Got message:", msg_obj);
                var battle_manager = this;
                var robot = battle_manager._robots[robot_id];
                                    
                switch(msg_obj["signal"]) {
                    default:
                        msg_obj["progress"] = 0;
                        robot.events.unshift(msg_obj);
                        break;
                }
            },
            _send: function(robot_id, msg_obj) {
                var battle_manager = this;
                battle_manager._robots[robot_id]["worker"]._receive(msg_obj);
            },
            _send_all: function(msg_obj) {
                var battle_manager = this;
                for(var r in battle_manager._robots) {
                    battle_manager._send(r, msg_obj);
                }
            },      
            
            run: function() {
                var battle_manager = this;
                battle_manager._keepOnRunning = true;
                battle_manager._startTime = (new Date()).getTime();

                var runLoop = function () {
                    for (var i = 0; i < 15; i++) {
                        if (battle_manager._keepOnRunning) {
                            battle_manager._update();                            
                        }
                    }
                    if (battle_manager._keepOnRunning) {
                        setTimeout(runLoop, 16);
                    }
                    battle_manager._draw();
                };
                setTimeout(runLoop, 16);
                battle_manager._send_all({
                    "signal": "RUN"
                });
            },

            stop: function () {
                var battle_manager = this;
                this._keepOnRunning = false;
                _.each(battle_manager._robots, function (robot) {
                    delete battle_manager._robots[robot.id];
                });
            },

            _checkEndConditions : function () {
                if (this._maxIterations > 0 && this._iterations > this._maxIterations) {
                    this.loseCb();
                    return true;
                }
                if (this._youLose) {
                    this.loseCb();
                    return true;
                }
                if (_.keys(this._robots).length === 1) {
                    this.winCb();
                    return true;
                }
                return false;
            },

            _update: function () {
                var battle_manager = this;

                battle_manager._iterations += 1;
                if (battle_manager._iterations % 10000 === 0) {
                    var currentMs = (new Date()).getTime();
                    var msElapsed = currentMs - this._startTime;
                    console.log("Iterations / second:", this._iterations / msElapsed * 1000);
                }
                
                if (battle_manager._checkEndConditions()) {
                    console.log("Match length:", this._iterations);
                    this.stop();
                }

                _.each(battle_manager._robots, function (robot) {
                    if(robot["health"]<=0) {
                        delete battle_manager._robots[robot.id];
                        battle_manager._explosions.push({
                            "x": robot["x"],
                            "y": robot["y"],
                            "progress": 1
                        });
                        console.log("Robot says kaboom:", robot);
                        if (robot.id === 'robot-0') {
                             battle_manager._youLose = true;
                        }
                    }
                });
                        
                _.each(battle_manager._robots, function (robot) {
                    var wall_collide = null;
                    var enemy_robot = null;
                    var robot_hit = null;

                    if(robot["bullet"]) {
                        robot["bullet"]["x"] += 
                            BULLET_SPEED * 
                            Math.cos(Utils.degree2radian(robot["bullet"]["direction"]));
                        robot["bullet"]["y"] += 
                            BULLET_SPEED * 
                            Math.sin(Utils.degree2radian(robot["bullet"]["direction"]));
                        
                        wall_collide = !Utils.is_point_in_square(
                            robot["bullet"]["x"], robot["bullet"]["y"], 
                            2, 2, 
                            ARENA_WIDTH-2, ARENA_HEIGHT-2
                        );
                        
                        if(wall_collide) {
                            robot["bullet"] = null;
                        } else {
                            for(var r2 in battle_manager._robots) {
                                enemy_robot = battle_manager._robots[r2];
                                
                                if(robot["id"]==enemy_robot["id"]) {
                                    continue;
                                }

                                robot_hit = Utils.distance(
                                    robot["bullet"]["x"], robot["bullet"]["y"],
                                    enemy_robot["x"], enemy_robot["y"]
                                ) < 20;
                                
                                /*
                                var robot_collide = Utils.is_point_in_square(
                                    robot["bullet"]["x"], robot["bullet"]["y"], 
                                    enemy_robot["x"]-15, enemy_robot["y"]-15, 
                                    30, 30
                                );
                                */
                                
                                if(robot_hit) {
                                    // console.log("HIT!");
                                    enemy_robot["health"] -= 3;
                                    battle_manager._explosions.push({
                                        "x": enemy_robot["x"],
                                        "y": enemy_robot["y"],
                                        "progress": 1
                                    });
                                    robot["bullet"] = null;
                                    // throw robot["id"] + " HIT " + enemy_robot["id"];
                                    break;
                                }
                            }
                        }
                    }
                        
                    for(var e=0; e<robot["events"].length; e++) {
                        var event = robot["events"].pop();
                        if (event === undefined) {
                            continue;
                        }
                    
                        switch(event["signal"]) {
                            case "SHOOT":
                                if(!robot["bullet"]) {
                                    robot["bullet"] = {
                                        "x": robot["x"],
                                        "y": robot["y"],
                                        "direction": robot["direction"]+robot["turret_direction"]
                                    };
                                }
                                break;
                            case "MOVE":
                                event["progress"]++;
                            
                                var new_x = robot["x"] + (event["distance"]>0?1:-1) * Math.cos(Utils.degree2radian(robot["direction"]));
                                var new_y = robot["y"] + (event["distance"]>0?1:-1) * Math.sin(Utils.degree2radian(robot["direction"]));
                                /*
                                var new_x = Math.round(robot["x"] + (event["distance"]>0?1:-1) * Math.cos(Utils.degree2radian(robot["direction"])));
                                var new_y = Math.round(robot["y"] + (event["distance"]>0?1:-1) * Math.sin(Utils.degree2radian(robot["direction"])));
                                */
                                
                                wall_collide = !Utils.is_point_in_square(
                                    new_x, new_y, 
                                    2, 2, 
                                    ARENA_WIDTH-2, ARENA_HEIGHT-2
                                );
                            
                                if(wall_collide) {
                                    // console.log("wall " + robot["direction"] + " " + robot["x"] + " " + new_x + " " + wall_collide);
                                    robot["health"] -= 1;
                                    battle_manager._send(robot.id, {
                                        "signal": "CALLBACK",
                                        "callback": event["callback"],
                                        "status": "WALL_COLLIDE"
                                    });
                                    break;
                                }
                                
                                for(var r3 in battle_manager._robots) {
                                    enemy_robot = battle_manager._robots[r3];
                                
                                    if( robot["id"] == enemy_robot["id"]) {
                                        continue;
                                    }

                                    robot_hit = Utils.distance(
                                        new_x, new_y,
                                        enemy_robot["x"], enemy_robot["y"]
                                    ) < 25;
                                                                
                                    if(robot_hit) {
                                        enemy_robot["health"]--;
                                        robot["health"]--;
                                        battle_manager._send(robot.id, {
                                            "signal": "CALLBACK",
                                            "callback": event["callback"],
                                            "status": "ENEMY_COLLIDE"
                                        });
                                        break;
                                    }
                                }

                                if(robot_hit) {
                                    break;
                                }
                            
                                if(event["progress"]>Math.abs(event["distance"])) {
                                    // console.log("move-over " + robot["id"]);
                                    battle_manager._send(robot.id, {
                                        "signal": "CALLBACK",
                                        "callback": event["callback"],
                                        "status": "DONE"
                                    });
                                    break;
                                }   
                                
                                robot["x"] = new_x;
                                robot["y"] = new_y;
                                robot["events"].unshift(event);
                                
                                break;
                            case "ROTATE":
                                if(event["progress"]==Math.abs(parseInt(event["angle"]))) {
                                    battle_manager._send(robot.id, {
                                        "signal": "CALLBACK",
                                        "callback": event["callback"],
                                        "status": "DONE"
                                    });
                                    break;
                                    
                                }
                                robot["direction"] += (event["angle"]>0?1:-1);
                                event["progress"]++;
                                robot["events"].unshift(event);

                                break;
                            case "ROTATE_TURRET":
                                if(event["progress"]==Math.abs(event["angle"])) {
                                    battle_manager._send(robot.id, {
                                        "signal": "CALLBACK",
                                        "callback": event["callback"]
                                    });
                                    break;
                                    
                                }
                                robot["turret_direction"] += (event["angle"]>0?1:-1);
                                event["progress"]++;
                                robot["events"].unshift(event);

                                break;
                        }
                        battle_manager._send(robot.id, {
                            "signal": "UPDATE",
                            "x": robot["x"],
                            "y": robot["y"]
                        });
                    }
                });
            },
            _draw: function () {
                var battle_manager = this;
                
                battle_manager._ctx.clearRect(0, 0, 800, 400);
                
                
                function draw_robot(ctx, robot) {

                    if (!ctx.body) {
                        var b = new Image(), t = new Image(), r = new Image();
                        b.src = "assets/robojs/img/body.png";
                        t.src = "assets/robojs/img/turret.png";
                        r.src = "assets/robojs/img/radar.png";
                        ctx.body = b;
                        ctx.turret = t;
                        ctx.radar = r;
                        ctx.explosion_images = [];
                        for (var i = 1; i <= 17; i++) {
                            var next = new Image();
                            next.src = "assets/robojs/img/explosion/explosion1-" + i +'.png';
                            ctx.explosion_images.push(next);
                        }
                    }
                    

                    body = ctx.body;
                    turret = ctx.turret;
                    radar = ctx.radar;
                    ctx.drawImage(body, -18, -18, 36, 36);
                    ctx.rotate(Utils.degree2radian(robot["turret_direction"]));
                    ctx.drawImage(turret, -25, -10, 54, 20);
                    robot["radar_direction"]++;
                    ctx.rotate(Utils.degree2radian(robot["radar_direction"]));
                    ctx.drawImage(radar, -8, -11, 16, 22);
                }
                
                // draw robots
                for(var r in battle_manager._robots) {
                    var robot = battle_manager._robots[r];
                    
                    // draw robot
                    battle_manager._ctx.save();
                    battle_manager._ctx.translate(robot["x"],robot["y"]);
                    battle_manager._ctx.rotate(Utils.degree2radian(robot["direction"]));
                    draw_robot(battle_manager._ctx, robot);
                    battle_manager._ctx.restore();
                    
                    // draw bullet
                    if(robot["bullet"]) {
                        battle_manager._ctx.save();
                        battle_manager._ctx.translate(robot["bullet"]["x"],robot["bullet"]["y"]);
                        battle_manager._ctx.rotate(Utils.degree2radian(robot["bullet"]["direction"]));
                        ctx.fillRect(-3,-3,6,6);
                        battle_manager._ctx.restore();
                    }
                    
                    battle_manager._ctx.beginPath();
                    battle_manager._ctx.strokeStyle = "red";
                    battle_manager._ctx.moveTo(robot["x"]-40,robot["y"]);
                    battle_manager._ctx.lineTo(robot["x"]+40,robot["y"]);
                    battle_manager._ctx.moveTo(robot["x"],robot["y"]-40);
                    battle_manager._ctx.lineTo(robot["x"],robot["y"]+40);
                    battle_manager._ctx.stroke();
                    battle_manager._ctx.closePath();
                    
                    battle_manager._ctx.strokeText(robot["id"] + " (" + robot["health"] + ")", robot["x"]-20,robot["y"]+35);
                    battle_manager._ctx.fillStyle = "green";
                    battle_manager._ctx.fillRect(robot["x"]-20,robot["y"]+35, robot["health"], 5);
                    battle_manager._ctx.fillStyle = "red";
                    battle_manager._ctx.fillRect(robot["x"]-20+robot["health"],robot["y"]+35, 25-robot["health"], 5);
                    battle_manager._ctx.fillStyle = "black";
                }
                for(var e=0; e<battle_manager._explosions.length; e++) {
                    var explosion = battle_manager._explosions.pop();
                    
                    if(explosion["progress"]<17) {
                        var explosion_img = null;
                        explosion_img = ctx.explosion_images[Math.floor(explosion["progress"])];
                        battle_manager._ctx.drawImage(explosion_img, explosion["x"]-64, explosion["y"]-64);
                        explosion["progress"]+= 0.5;
                        battle_manager._explosions.unshift(explosion);
                    }
                }
            },

            winCb : null,
            abortCb : null,
            loseCb : null
        };
        
        var robot_list = _.cloneDeep(conf.robots);
        robot_list.unshift('UserBot');
        console.log("Selecting robots:", robot_list);
        BattleManager.init(ctx, robot_list, conf.timeLimit);
        BattleManager.run();
        return BattleManager;
    };

    return {
        init : function (conf) {
            console.log("Going to initialize robot game", conf);
            var theGame = null;
            var winCb = null;
            var loseCb = null;
            var abortCb = null;

            // main API for writing more game engines here
            return {
                start : function (code, canvas) {
                    if (robotDb.save('UserBot', code)) {
                        console.log("Starting game with ", code, canvas);
                        if (theGame !== null) {
                            theGame.stop();
                            if (theGame.abortCb) {
                                theGame.abortCb();
                            }
                        }
                        theGame = robotGameEngine(canvas, conf);
                        console.log("theGame", theGame);                        
                    } else {
                        console.log("Failed to start game.");
                    }
                    return this;
                },
                stop : function (cb) {
                    if (theGame !== null) {
                        theGame.stop();
                        if (theGame.abortCb) {
                            theGame.abortCb();
                        }
                    }
                    return this;
                },
                win : function (cb) {
                    theGame.winCb = cb;
                    return this;
                },
                lose : function (cb) {
                    theGame.loseCb = cb;
                    return this;                    
                },
                abort : function (cb) {
                    theGame.abortCb = cb;
                    return this;
                }
            };
        }
    };
}])
;
