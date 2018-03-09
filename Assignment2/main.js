const MAX_SPAWNED = 20;
var AM = new AssetManager();
var OUT = 0;

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


// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    this.player = 1;
    this.radius = 10;
    this.visualRadius = 500;
	this.game = game;
    this.colors = ["Violet", "Blue", "Purple", "White"];
    this.setNotIt();
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
    this.visualRadius = 500;
};

Circle.prototype.setNotIt = function () {
    this.it = false;
    this.visualRadius = 300;
};

Circle.prototype.purpleCaught = function () {
    this.setNotIt();
	this.color = 3; //turn it white
};

Circle.prototype.whiteCaught = function () {
    this.setNotIt();
	this.color = 1; //turn it blue
};

Circle.prototype.blueCaught = function () {
    this.setNotIt();
	OUT++;
	this.game.out.innerHTML = OUT + " out";
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
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = this.game.surfaceWidth - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = this.game.surfaceHeight - this.radius;
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
            if (this.it) {
                //this.setNotIt();
                //ent.setIt();
				if (ent.color === 2) {
					ent.purpleCaught();
				} else if (ent.color === 3) {
					ent.whiteCaught();
				} else if (ent.color === 1) {
					ent.blueCaught();
				} 
            }
            else if (ent.it) {
                //this.setIt();
                //ent.setNotIt();
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
            if (this.it && dist > this.radius + ent.radius + 10) {
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
            if (ent.it && dist > this.radius + ent.radius) {
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
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
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
    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("../img/tiled_background.png")));
    var circle = new Circle(gameEngine);
	circle.setIt();
    circle.color = 0; //make this circle the chaser
    gameEngine.addEntity(circle);

    for (var i = 0; i < MAX_SPAWNED; i++) {
        circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    };

    gameEngine.start();
});
