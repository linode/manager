function Player(x, y, img) {
  this.row = x / CELL_SIZE;
  this.column = y / CELL_SIZE;
  this.speed = 1;

  var xp = this.xp = this.startX = x;
  var yp = this.yp = this.startY = y;
  var dirX = this.dirX = 0;
  var dirY = this.dirY = 0;

  var animation = this.animation = new Animation(img, CELL_SIZE, CELL_SIZE, domElement);
  animation.offsetY = 0;
  animation.offsetX = 0;
  animation.looping = true;
  animation.stop();

  var domElement = this.domElement = this.animation.domElement;

  this.moveRight = function() {
    this.dirX = this.speed;
    this.dirY = 0;
    this.animation.rotation = 0;
    if (!this.animation.playing) this.animation.play();
  };

  this.moveLeft = function() {
    this.dirX = -this.speed;
    this.dirY = 0;
    this.animation.rotation = 180;
    if (!this.animation.playing) this.animation.play();
  };

  this.moveUp = function() {
    this.dirX = 0;
    this.dirY = -this.speed;
    this.animation.rotation = 90;
    if (!this.animation.playing) this.animation.play();
  };

  this.moveDown = function() {
    this.dirX = 0;
    this.dirY = this.speed;
    this.animation.rotation = 270;
    if (!this.animation.playing) this.animation.play();
  };

  this.stopMovement = function() {
    this.dirX = this.dirY = 0;
    this.animation.stop();
  };

  this.update = function() {
    this.xp += this.dirX;
    this.yp += this.dirY;

    this.animation.x = this.xp;
    this.animation.y = this.yp;
    this.animation.update();
  };

  this.render = function() {
    this.animation.render();
  };

  this.reset = function() {
    this.xp = this.startX;
    this.yp = this.startY;
    this.stopMovement();
    this.animation.rotation = 0;
    this.animation.gotoAndStop(1);
  };

  this.init = function() {
    this.update();
    this.render();
  }
}
