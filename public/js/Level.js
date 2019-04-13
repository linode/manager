function Level(img, c) {
  var context = c;
  this.totalPips = 0;

  // create a greenscreen behind level so
  // we can detect what is a wall etc
  context.fillStyle = "#00FF00";
  context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  context.drawImage(img, 0, 0);

  var w = 0,
    h, xp = CELL_SIZE / 2,
    yp, pip;
  var cellData = this.cellData = [];
  var pips = this.pips = [];

  for (w; w < GRID_WIDTH; ++w) {
    cellData[w] = [];
    pips[w] = [];
    yp = CELL_SIZE / 2;
    h = 0;

    for (h; h < GRID_HEIGHT; ++h) {
      cellData[w][h] = (context.getImageData(xp, yp, 1, 1).data[1] == 255) ? 1 : 0;
      if (cellData[w][h] == 1) {
        //add pip
        var pip = new Pip(xp, yp, 7);
        container.appendChild(pip.domElement);
        pips[w][h] = pip;
        ++this.totalPips;
      }
      yp += CELL_SIZE;
    }
    xp += CELL_SIZE;
  }

  // revert the bg to black
  context.fillStyle = "#fff";
  context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  context.drawImage(img, 0, 0);

  this.reset = function() {
    var w = pips.length;
    while (--w > -1) {
      var h = pips[w].length;
      while (--h > -1) {
        if (pips[w][h] != null && pips[w][h].munched) {
          pips[w][h].reset();
          cellData[w][h] = 1;
        }
      }
    }
  };
}
