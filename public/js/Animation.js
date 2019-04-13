function Animation(img, w, h, domElem) {
  var img = (this.img = img);
  var domElement = (this.domElement = domElem);
  this.playing = true;
  this.looping = true;
  this.width = w;
  this.height = h;
  this.x = 0;
  this.y = 0;
  this.rotation = 0;
  this.offsetX = 0;
  this.offsetY = 0;
  this.spriteSheetWidth = this.img.width;
  this.numFrames = Math.floor(this.spriteSheetWidth / this.width);
  this.currentFrame = 0;

  if (!this.domElement) {
    this.domElement = document.createElement('div');
    this.domElement.className = 'animation';
    this.domElement.style.background = 'url(' + img.src + ')';
    this.domElement.style.width = this.width + 'px';
    this.domElement.style.height = this.height + 'px';
  }

  this.update = function() {
    if (this.playing) {
      var nextFrame = this.currentFrame + 1;

      if (nextFrame >= this.numFrames) {
        if (this.looping) {
          this.gotoAndStop(0);
        } else {
          this.playing = false;
          this.gotoAndStop(this.numFrames - 1);
        }
      } else {
        this.gotoAndStop(nextFrame);
      }
    }
  };

  this.render = function() {
    var dom = this.domElement;
    var offset = this.currentFrame * this.width;

    dom.style.background = 'url(' + img.src + ')';
    dom.style.width = this.width + 'px';
    dom.style.height = this.height + 'px';
    dom.style.backgroundPosition = offset + 'px 0 ';

    var xp = Math.round(this.x + this.offsetX);
    var yp = Math.round(this.y + this.offsetY);

    styleStr = 'translate(' + xp + 'px, ' + yp + 'px)';
    dom.style.webkitTransform = styleStr;
    dom.style.MozTransform = styleStr;
    dom.style.OTransform = styleStr;
    dom.style.transform = styleStr;

    styleStr = 'rotate(' + this.rotation + 'deg)';
    dom.style.webkitTransform += styleStr;
    dom.style.MozTransform += styleStr;
    dom.style.OTransform += styleStr;
    dom.style.transform += styleStr;
  };

  this.play = function() {
    this.playing = true;
  };

  this.gotoAndStop = function(framenum) {
    this.currentFrame = framenum;
  };

  this.stop = function() {
    this.playing = false;
  };
}
