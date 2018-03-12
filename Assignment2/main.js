var AM = new AssetManager();
var GAME;
var OUT = 0;
var MAX_SPAWNED = 30;

function Background(spritesheet) {
    this.x = 0;
    this.y = 0;
	this.sx = 510;
	this.sy = 780;
	this.w = 255;
	this.h = 156;
    this.spritesheet = spritesheet;
    this.ctx = GAME.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet, this.x, this.y, this.w, this.h, this.x, this.y, 3*this.w, 3*this.h);
};

Background.prototype.update = function () {
	//stationary
};

function counters() {
	if (OUT !== MAX_SPAWNED) {
		GAME.out.innerHTML = OUT + "/" + MAX_SPAWNED + " caught";
	} else {
		GAME.out.innerHTML = OUT + "/" + MAX_SPAWNED + " caught. Simulation over. Refresh to begin again!";
	}
}

// GameBoard code below modified from Chris Marriott's code.

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle() {
    this.player = 1;
    this.radius = 7;
    this.visualRadius = 300;
    this.colors = ["Violet", "Blue", "Purple", "White", "Green"];
    this.it = false;
	this.booster = false;
	this.boosted = false;
	this.boostedTime = 0;
	this.color = 2; //Math.floor(Math.random() * (3 - 1 + 1)) + 1; //randomly choose color that isn't violet
    Entity.call(this, this.radius + Math.random() * (GAME.surfaceWidth - this.radius * 2), this.radius + Math.random() * (GAME.surfaceHeight - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.setIt = function () {
    this.it = true;
    this.color = 0;
    this.visualRadius = 300;
};

Circle.prototype.purpleCaught = function () {
    this.it = false;
	this.color = 3; //turn it white
    this.visualRadius = 400;
};

Circle.prototype.whiteCaught = function () {
    this.it = false;
	this.color = 1; //turn it blue
    this.visualRadius = 500;
};

Circle.prototype.blueCaught = function () {
    this.it = false;
	OUT++;
	var circle = null;
	var rand = Math.floor(Math.random() * (3 - 1 + 1)) + 1; //random number [1, 3]
	if (rand === 1) {
		for (var i = 0; i < 2; i++) {
			circle = new Circle();
			GAME.addEntity(circle);
			MAX_SPAWNED++;
		}
	}
	counters();
	this.removeFromWorld = true;	//delete this circle because it's out
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > GAME.surfaceWidth;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > GAME.surfaceHeight;
};

Circle.prototype.update = function () {
	if (OUT === MAX_SPAWNED) {
		GAME.over = true;
	}
	
	if(this.boosted){
		this.boostedTime += GAME.clockTick;
		if(this.boostedTime > 1){
			this.boosted = false;
		}
	}
	
	//if (!this.booster) {
		Entity.prototype.update.call(this);
	 //  console.log(this.velocity);
	 
		if(this.boosted){
			this.x += this.velocity.x * GAME.clockTick * 2;
			this.y += this.velocity.y * GAME.clockTick * 2;
		} else {
			this.x += this.velocity.x * GAME.clockTick;
			this.y += this.velocity.y * GAME.clockTick;
		}


		if (this.collideLeft() || this.collideRight()) {
			this.velocity.x = -this.velocity.x * friction;
			if (this.collideLeft()) this.x = this.radius + 1;
			if (this.collideRight()) this.x = GAME.surfaceWidth - this.radius - 1;
			this.x += this.velocity.x * GAME.clockTick;
			this.y += this.velocity.y * GAME.clockTick;
		}

		if (this.collideTop() || this.collideBottom()) {
			this.velocity.y = -this.velocity.y * friction;
			if (this.collideTop()) this.y = this.radius + 1;
			if (this.collideBottom()) this.y = GAME.surfaceHeight - this.radius - 1;
			this.x += this.velocity.x * GAME.clockTick;
			this.y += this.velocity.y * GAME.clockTick;
		}

		for (var i = 0; i < GAME.entities.length; i++) {
			var ent = GAME.entities[i];
			if (ent !== this && this.collide(ent)) {
				var temp = { x: this.velocity.x, y: this.velocity.y };

				var dist = distance(this, ent);
				var delta = this.radius + ent.radius - dist;
				var difX = (this.x - ent.x)/dist;
				var difY = (this.y - ent.y)/dist;

				this.x += difX * delta / 2;
				this.y += difY * delta / 2;
				ent.x -= difX * delta / 2;
				ent.y -= difY * delta / 2;

				this.velocity.x = ent.velocity.x * friction;
				this.velocity.y = ent.velocity.y * friction;
				ent.velocity.x = temp.x * friction;
				ent.velocity.y = temp.y * friction;
				this.x += this.velocity.x * GAME.clockTick;
				this.y += this.velocity.y * GAME.clockTick;
				ent.x += ent.velocity.x * GAME.clockTick;
				ent.y += ent.velocity.y * GAME.clockTick;
				
				if(ent.booster){
					this.boosted = true;
				}
				
				if (this.it) {
					if (ent.color === 2) {
						ent.purpleCaught();
					} else if (ent.color === 3) {
						ent.whiteCaught();
					} else if (ent.color === 1) {
						ent.blueCaught();
					} 
				}
				else if (ent.it) {
					if (this.color === 2) {
						this.purpleCaught();
					} else if (this.color === 3) {
						this.whiteCaught();
					} else if (this.color === 1) {
						this.blueCaught();
					} 
				}
			}

			if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
				var dist = distance(this, ent);
				if ((this.it && dist > this.radius + ent.radius + 10) && !ent.booster) {
					var difX = (ent.x - this.x)/dist;
					var difY = (ent.y - this.y)/dist;
					this.velocity.x += difX * acceleration / (dist*dist);
					this.velocity.y += difY * acceleration / (dist * dist);
					var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
					if (speed > maxSpeed) {
						var ratio = maxSpeed / speed;
						this.velocity.x *= ratio;
						this.velocity.y *= ratio;
					}
				}
				if (ent.it && dist > this.radius + ent.radius && !this.booster) {
					var difX = (ent.x - this.x) / dist;
					var difY = (ent.y - this.y) / dist;
					this.velocity.x -= difX * acceleration / (dist * dist);
					this.velocity.y -= difY * acceleration / (dist * dist);
					var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
					if (speed > maxSpeed) {
						var ratio = maxSpeed / speed;
						this.velocity.x *= ratio;
						this.velocity.y *= ratio;
					}
				}
			}
		}
		this.velocity.x -= (1 - friction) * GAME.clockTick * this.velocity.x;
		this.velocity.y -= (1 - friction) * GAME.clockTick * this.velocity.y;


	//}
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
	if(this.boosted){
		ctx.fillStyle = "Green";
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
	}
    ctx.closePath();

};

// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;

// the "main" code begins here
AM.queueDownload("../img/tiled_background.png");

AM.downloadAll(function () {
    var canvas = document.getElementById('assignment2');
    var ctx = canvas.getContext('2d');
	var out = document.getElementById('out');

    GAME = new GameEngine();
	var gameEngine = GAME;
    gameEngine.init(ctx);
	gameEngine.out = out;
	gameEngine.out.innerHTML = OUT + "/" + MAX_SPAWNED + " caught";
	
    gameEngine.background = new Background(AM.getAsset("../img/tiled_background.png"));
    var circle = new Circle();
	circle.setIt();
    circle.color = 0; //make this circle the chaser
    gameEngine.addEntity(circle);
	
	var rand = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
	var boost = null; 
	for (var i = 0; i < rand; i++) {
		boost = new Circle();
		boost.booster = true;
		boost.radius = 15;
		boost.color = 4; //make this circle the booster
		gameEngine.addEntity(boost);
	}

    for (var i = 0; i < MAX_SPAWNED; i++) {
        circle = new Circle();
        gameEngine.addEntity(circle);
    };

    gameEngine.start();
});

//Assignment 3 code starts here.
var socket = io.connect("http://24.16.255.56:8888");

window.onload = function () {
    console.log("starting sockets");
    var messages = [];
    var username = "Bridgette Campbell";
    var content = document.getElementById("assignment2");

    socket.on("ping", function (ping) {
        console.log(ping);
        socket.emit("pong");
    });
	
	socket.on("load", function (data) {
		GAME.entities = [];
		OUT = 0;
		MAX_SPAWNED = 0;
		console.log(data.data);
		var entitiesCount = data.data.circles.length;
		for (var i = 0; i < entitiesCount; i++) {
			dataCircle = data.data.circles[i];
			var entity = new Circle();
			entity.x = dataCircle.x;
			entity.y = dataCircle.y;
			entity.removeFromWorld = dataCircle.removeFromWorld;
			entity.player = dataCircle.player;
			entity.radius = dataCircle.radius;
			entity.visualRadius = dataCircle.visualRadius;
			entity.colors = dataCircle.colors;
			entity.it = dataCircle.it;
			entity.booster = dataCircle.booster;
			entity.boosted = dataCircle.boosted;
			entity.boostedTime = dataCircle.boostedTime;
			entity.color = dataCircle.color;
			entity.velocity = dataCircle.velocity;
			
			GAME.entities[i] = entity;
		}
		OUT = data.data.caught;
		MAX_SPAWNED = data.data.max;
		counters();
		GAME.loop();
	});
	
    socket.on("sync", function (data) {
        messages = data;
        var html = '';
        for (var i = 0; i < messages.length; i++) {
            html += '<b>' + (messages[i].username ? messages[i].username : "Server") + ": </b>";
            html += messages[i].message + "<br />";
        }
        content.innerHTML = html;
        content.scrollTop = content.scrollHeight;
        console.log("sync " + html);
    });

    socket.on("message", function (data) {
        if (data.message) {
            messages.push(data);
            var html = '';
            for (var i = 0; i < messages.length; i++) {
                html += '<b>' + (messages[i].username ? messages[i].username : "Server") + ": </b>";
                html += messages[i].message + "<br />";
            }
            content.innerHTML = html;
            content.scrollTop = content.scrollHeight;
        } else {
            console.log("No message.");
        }

    });

    window.onkeydown = function (e) {
        if (e.keyCode === 83) { //s for save/send			
			var send = {circles: GAME.entities, caught: OUT, max: MAX_SPAWNED};
			console.log(send);
			socket.emit("save", { studentname: "Bridgette Campbell", statename: "assignment2State", data: send });
        } else if (e.keyCode === 82) { //r for read/reload
			socket.emit("load", { studentname: "Bridgette Campbell", statename: "assignment2State" });
		}
    };

    socket.on("connect", function () {
        console.log("Socket connected.")
    });
    socket.on("disconnect", function () {
        console.log("Socket disconnected.")
    });
    socket.on("reconnect", function () {
        console.log("Socket reconnected.")
    });

};

