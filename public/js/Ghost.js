function Ghost(x, y, img) {
  this.row = x / CELL_SIZE;
  this.column = y / CELL_SIZE;

  this.speed = 1;

  var xp = this.xp = this.startX = x;
  var yp = this.yp = this.startY = y;

  var dirX = this.dirX = 0;
  var dirY = this.dirY = 0;

  this.chaseTime = 7;
  this.idleTime = 3;
  this.chasing = false;
  var scope = this;
  this.interval = setInterval(function() {
    scope.changeChase()
  }, 1000 * this.idleTime);

  this.width = 32;
  this.height = 32;

  var animation = this.animation = new Animation(img, 32, 32, domElement);
  animation.offsetY = 0;
  animation.offsetX = 0;
  animation.looping = true;
  animation.play();

  var domElement = this.domElement = this.animation.domElement;

  this.moveRight = function() {
    this.dirX = this.speed;
    this.dirY = 0;
    this.animation.rotation = 0;
  };

  this.moveLeft = function() {
    this.dirX = -this.speed;
    this.dirY = 0;
    this.animation.rotation = 180;
  };

  this.moveUp = function() {
    this.dirX = 0;
    this.dirY = -this.speed;
    this.animation.rotation = 270;
  };

  this.moveDown = function() {
    this.dirX = 0;
    this.dirY = this.speed;
    this.animation.rotation = 90;
  };

  this.stopMovement = function() {
    this.dirX = this.dirY = 0;
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

  this.getLeft = function() {
    return this.xp;
  };

  this.getRight = function() {
    return this.xp + this.width;
  };

  this.getTop = function() {
    return this.yp;
  };

  this.getBottom = function() {
    return this.yp + this.height;
  };

  this.changeChase = function() {
    clearInterval(this.interval);
    this.chasing = !this.chasing;

    var scope = this;
    var time = this.chasing ? this.chaseTime : this.idleTime;
    this.interval = setInterval(function() {
      scope.changeChase()
    }, 1000 * time);
  };

  this.reset = function() {
    this.xp = this.startX;
    this.yp = this.startY;
  }

  this.init = function() {
    this.update();
    this.render();
  }
}
