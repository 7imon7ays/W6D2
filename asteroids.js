var Asteroids = (function() {


var canvas = document.getElementById("canvas").getContext('2d');

canvas.width = 500;

function Position(x, y) {
	this.x = x;
	this.y = y;
}

function MovingObject(position) {
	var that = this;
	this.x = position.x;
	this.y = position.y;

	this.update = function(newPosition) {
		that.x = newPosition.x;
		that.y = newPosition.y;
	}
}

MovingObject.prototype.offScreen = function() {
	return (this.x > 500 || this.y > 500 ||
					this.x < 0 || this.y < 0);
};

function Bullet(position, direction, game) {
	var that = this;
	MovingObject.apply(this, [position]);
	this.size = 5;
	this.direction = direction;
	this.speed = 20;
	this.velocity = {x: this.speed * direction.x,
									 y: this.speed * direction.y};
	game.bullets.push(that);
}

Bullet.prototype = new MovingObject(new Position());

Bullet.prototype.changePosition = function () {
	newX = this.x + this.velocity.x;
	newY = this.y + this.velocity.y;

	return new Position(newX, newY);
}

Bullet.prototype.draw = function () {
	var that = this;

	canvas.fillStyle   = '#0f0';
	canvas.strokeStyle = '#f00';

	canvas.beginPath();
	canvas.arc(that.x, that.y, that.size, 0, Math.PI*2, true);
	canvas.closePath();
	canvas.fill();
}

function Ship(startPos) {
	MovingObject.apply(this, arguments);
	this.size = 20;
	this.velocity = { x: 0, y: 0 };
}

Ship.prototype = new MovingObject(new Position());

Ship.prototype.draw = function (canvas) {
	var that = this;

	canvas.fillStyle   = '#00f';
	canvas.strokeStyle = '#f00';

	canvas.beginPath();
	canvas.arc(that.x, that.y, that.size, 0, Math.PI*2, true);
	canvas.closePath();
	canvas.fill();
}

Ship.prototype.fireBullet = function (game) {
	var that = this;
	var shipPos = new Position(that.x, that.y);
	return new Bullet(shipPos, that.getDirection(), game);
}

Ship.prototype.getDirection = function () {
	var that = this;
	var v = that.velocity;
	var speed = Math.sqrt((v.x * v.x) + (v.y * v.y));

	return { x: (v.x / speed), y: (v.y / speed) };
}

Ship.prototype.power = function (keyCode) {
	var that = this;

	switch (keyCode) {
		case 37:
			that.velocity.x -= 2;
			break;
		case 38:
			that.velocity.y -= 2;
			break;
		case 39:
			that.velocity.x += 2;
			break;
		case 40:
			that.velocity.y += 2;
			break;
		default:
			// that.velocity.x = 0;
// 			that.velocity.y = 0;
			break;
	}
}

Ship.prototype.isHit = function (asteroidsArr) {
	var that = this;
	for (var i = 0; i < asteroidsArr.length; i++) {
		var asteroidPosition = new Position(asteroidsArr[i].x, asteroidsArr[i].y);
		var shipPosition = new Position(that.x, that.y);
		if (distanceCalculator(asteroidPosition, shipPosition) < (20 + asteroidsArr[i].size)){
			return true;
		}
	}
	return false;
}

Ship.prototype.createMovePos = function() {
	var that = this;
	xMove = (that.x + that.velocity.x);
	yMove = (that.y + that.velocity.y);

	if (xMove > 500){
		xMove %= 500;
	} else if (xMove < 0){
		xMove += 500;
	}

	if (yMove > 500){
		yMove %= 500;
	} else if (yMove < 0){
		yMove += 500;
	}

	return new Position(xMove, yMove);
};

var distanceCalculator = function (pos1, pos2) {
	var xDist = pos1.x - pos2.x;
	var yDist = pos1.y - pos2.y;

	var squaredDist = (xDist * xDist) + (yDist * yDist);
	return Math.sqrt(squaredDist);
}

function Asteroid(pos) {
	MovingObject.apply(this, arguments);
	this.delta = generateDelta();
	this.size = generateSize();
};

Asteroid.prototype = new MovingObject(new Position());

Asteroid.prototype.isHit = function (bulletsArr) {
	var that = this;
	for (var i = 0; i < bulletsArr.length; i++) {
		var bulletPosition = new Position(bulletsArr[i].x, bulletsArr[i].y);
		var asteroidPosition = new Position(that.x, that.y);

		if (distanceCalculator(bulletPosition, asteroidPosition) < (5 + that.size)){
			return true;
		}
	}
	return false;
}

Asteroid.randomAsteroid = function () {
	// Should keep generating new position as long as yielded position
	// is within a defined distance from the ship.

	var newX = Math.floor(Math.random()* 500);
	var newY = Math.floor(Math.random()* 500);

	newX < newY ? newX = 0 : newY = 0;

	var randPosition = new Position(newX, newY);
	return new Asteroid(randPosition);
}

Asteroid.prototype.draw = function (canvas) {
	var that = this;

	canvas.fillStyle   = '#111';
	canvas.strokeStyle = '#f00';

	canvas.beginPath();
	canvas.arc(that.x, that.y, that.size, 0, Math.PI*2, true);
	canvas.closePath();
	canvas.fill();
}

var generateDelta = function () {
	var x = Math.floor(Math.random() * 20) - 10;
	var y = Math.floor(Math.random() * 20) - 10;

	return [x, y];
}

var generateSize = function () {
	return (Math.random() + 1) * 20;
}

Asteroid.prototype.changePosition = function () {
	newX = this.x + this.delta[0];
	newY = this.y + this.delta[1];

	return new Position(newX, newY);
}

function Game(numAsteroids, canvas) {
	this.bullets = [];
	this.asteroids = [];
	for (var i = 0; i < numAsteroids; i++){
		this.asteroids.push(Asteroid.randomAsteroid());
	}
	this.canvas = canvas;
	this.ship = new Ship(new Position(250, 250));
}

Game.prototype.draw = function() {
	var that = this;

	that.canvas.clearRect(0, 0, 500, 500);
	that.ship.draw(that.canvas);

	for (var i =0; i < that.asteroids.length; i++){
		that.asteroids[i].draw(that.canvas);
	}

	for (var i =0; i < that.bullets.length; i++){
		that.bullets[i].draw(that.canvas);
	}
}

Game.prototype.start = function () {
	var that = this;

	document.addEventListener('keydown', function(event) {
		if (event.keyCode === 32) {
			that.ship.fireBullet(that);
		}	else {
			that.ship.power(event.keyCode);
		};
	})

	var intervalId = window.setInterval(function() {
		that.update();
		if (that.ship.isHit(that.asteroids)) {
			window.clearInterval(intervalId);
		}
	}, 32);
}

Game.prototype.update = function () {
	var that = this;
	that.bullets = _findKeepers(that.bullets);

	var numAllAsteroids = that.asteroids.length;
	that.asteroids = _findKeepers(that.asteroids);

	var numKeptAsteroids = that.asteroids.length;

	var numLostAsteroids = numAllAsteroids - numKeptAsteroids;

	var myShip = that.ship;

	myShip.update(myShip.createMovePos());

	// Need to figure out how to add more asteroids randomly
	var unhitAsteroids = [];
	for (var i = 0; i < that.asteroids.length; i++) {
		var thisAsteroid = that.asteroids[i];

		thisAsteroid.update(thisAsteroid.changePosition());
		that.draw();
		if (!thisAsteroid.isHit(that.bullets)) {
			unhitAsteroids.push(thisAsteroid);
		}
	}

	that.asteroids = unhitAsteroids;

	for (var i = 0; i < numLostAsteroids; i++) {
		that.asteroids.push(Asteroid.randomAsteroid());
	}

	for (var i = 0; i < that.bullets.length; i++) {
		var thisBullet = that.bullets[i];

		thisBullet.update(thisBullet.changePosition());
		that.draw();
	}

	if (myShip.isHit(that.asteroids)){
		alert("You got hit!");
	}
}

var _findKeepers = function (objectsArray) {
	keepers = [];
	for (var i = 0; i < objectsArray.length; i++){
		if (!objectsArray[i].offScreen()) {
			keepers.push(objectsArray[i]);
		}
	}
	return keepers;
}

	return {
		myCanvas: canvas,
		game: Game,
		asteroid: Asteroid,
		ship: Ship
	}

})();

c = Asteroids.myCanvas;
g = new Asteroids.game(6, c);
g.start();