var AM = new AssetManager();
var OUT = 0;
var MAX_SPAWNED = 30;

function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
	this.sx = 510;
	this.sy = 780;
	this.w = 255;
	this.h = 156;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet, this.x, this.y, this.w, this.h, this.x, this.y, 3*this.w, 3*this.h);
};

Background.prototype.update = function () {
	//stationary
};


// GameBoard code below modified from Chris Marriott's code.

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    this.player = 1;
    this.radius = 7;
    this.visualRadius = 300;
	this.game = game;
    this.colors = ["Violet", "Blue", "Purple", "White", "Green"];
    this.it = false;
	this.booster = false;
	this.boosted = false;
	this.boostedTime = 0;
	this.color = 2; //Math.floor(Math.random() * (3 - 1 + 1)) + 1; //randomly choose color that isn't violet
    Entity.call(this, this.game, this.radius + Math.random() * (this.game.surfaceWidth - this.radius * 2), this.radius + Math.random() * (this.game.surfaceHeight - this.radius * 2));

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
			circle = new Circle(this.game);
			this.game.addEntity(circle);
			MAX_SPAWNED++;
		}
	}
	if (OUT !== MAX_SPAWNED) {
		this.game.out.innerHTML = OUT + "/" + MAX_SPAWNED + " caught";
	} else {
		this.game.out.innerHTML = OUT + "/" + MAX_SPAWNED + " caught. Simulation over. Refresh to begin again!";
	}
	this.removeFromWorld = true;	//delete this circle because it's out
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > this.game.surfaceWidth;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > this.game.surfaceHeight;
};

Circle.prototype.update = function () {
	if (OUT === MAX_SPAWNED) {
		this.game.over = true;
	}
	
	if(this.boosted){
		this.boostedTime += this.game.clockTick;
		if(this.boostedTime > 1){
			this.boosted = false;
		}
	}
	
	//if (!this.booster) {
		Entity.prototype.update.call(this);
	 //  console.log(this.velocity);
	 
		if(this.boosted){
			this.x += this.velocity.x * this.game.clockTick * 2;
			this.y += this.velocity.y * this.game.clockTick * 2;
		} else {
			this.x += this.velocity.x * this.game.clockTick;
			this.y += this.velocity.y * this.game.clockTick;
		}


		if (this.collideLeft() || this.collideRight()) {
			this.velocity.x = -this.velocity.x * friction;
			if (this.collideLeft()) this.x = this.radius + 1;
			if (this.collideRight()) this.x = this.game.surfaceWidth - this.radius - 1;
			this.x += this.velocity.x * this.game.clockTick;
			this.y += this.velocity.y * this.game.clockTick;
		}

		if (this.collideTop() || this.collideBottom()) {
			this.velocity.y = -this.velocity.y * friction;
			if (this.collideTop()) this.y = this.radius + 1;
			if (this.collideBottom()) this.y = this.game.surfaceHeight - this.radius - 1;
			this.x += this.velocity.x * this.game.clockTick;
			this.y += this.velocity.y * this.game.clockTick;
		}

		for (var i = 0; i < this.game.entities.length; i++) {
			var ent = this.game.entities[i];
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
				this.x += this.velocity.x * this.game.clockTick;
				this.y += this.velocity.y * this.game.clockTick;
				ent.x += ent.velocity.x * this.game.clockTick;
				ent.y += ent.velocity.y * this.game.clockTick;
				
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
		this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
		this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;


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

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
	gameEngine.out = out;
	gameEngine.out.innerHTML = OUT + "/" + MAX_SPAWNED + " caught";
	
    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("../img/tiled_background.png")));
    var circle = new Circle(gameEngine);
	circle.setIt();
    circle.color = 0; //make this circle the chaser
    gameEngine.addEntity(circle);
	
	var rand = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
	var boost = null; 
	for (var i = 0; i < rand; i++) {
		boost = new Circle(gameEngine);
		boost.booster = true;
		boost.radius = 15;
		boost.color = 4; //make this circle the booster
		gameEngine.addEntity(boost);
	}

    for (var i = 0; i < MAX_SPAWNED; i++) {
        circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    };

    gameEngine.start();
});
