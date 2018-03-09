var AM = new AssetManager();

function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
	this.sx = 0;
	this.sy = 158;
	this.w = 255;
	this.h = 156;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet, this.sx, this.sy, this.w, this.h,
                   this.x, this.y, this.w, this.h);
};

Background.prototype.update = function () {
	//stationary
};

//Black Mage
function BlackMage(game, spritesheet) {
	this.animation = new Animation(spritesheet, 96, 96, 6, 0.5, 7, true, 0.5);
	this.x = 200; 
	this.y = 40;
	this.speed = 50;
	this.game = game;
	this.ctx = game.ctx;
}

BlackMage.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

BlackMage.prototype.update = function () {
	//stationary
}

//White Mage
function WhiteMage(game, spritesheet) {
	this.animation = new Animation(spritesheet, 24, 24, 10, 0.2, 5, true, 1.5);
	this.x = 255; 
	this.y = 0;
	this.speed = 40;
	this.game = game;
	this.ctx = game.ctx;
}

WhiteMage.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

WhiteMage.prototype.update = function () {
	this.x -= this.game.clockTick * this.speed;
	if (this.x < 0 ) this.x = 255; 
}



AM.queueDownload("./img/black_mage.png");
AM.queueDownload("./img/white_mage.png");
AM.queueDownload("./img/background.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("assignment2");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.png")));
    gameEngine.addEntity(new BlackMage(gameEngine, AM.getAsset("./img/black_mage.png")));
    gameEngine.addEntity(new WhiteMage(gameEngine, AM.getAsset("./img/white_mage.png")));
	
	

    console.log("All Done!");
});