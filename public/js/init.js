// game vars
var gameInterval,
  score = 0,
  isPlaying,
  isKeyDown,
  lastX,
  lastY,
  isSameColumn,
  isSameRow,
  // screen/game size vars
  SCREEN_WIDTH = 835,
  SCREEN_HEIGHT = 469,
  CELL_SIZE = 32,
  GRID_WIDTH = SCREEN_WIDTH / CELL_SIZE,
  GRID_HEIGHT = SCREEN_HEIGHT / CELL_SIZE,
  // timestep
  t = 0,
  dt = 10,
  currentTime = new Date().getTime(),
  accumulator = 0,
  // display surface vars
  canvas = document.createElement('canvas'),
  context = canvas.getContext('2d'),
  // buttons
  leftButton,
  rightButton,
  upButton,
  downButton,
  // input vars
  leftDown,
  rightDown,
  upDown,
  downDown,
  isTouch,
  // preload image resources
  assetImages = {};

var playerImage = (assetImages['player'] = new Image());
assetImages['player'].src = '/img/player_animated_2.png';

var ghostImage = (assetImages['ghost'] = new Image());
assetImages['ghost'].src = '/img/ghost.png';

var levelImage = (assetImages['level'] = new Image());
assetImages['level'].src = '/img/LinodePac.png';

function init() {
  // CANVAS SET UP
  zivcontainer = document.getElementById('linodepac');
  container = document.createElement('div');
  container.id = 'container';
  container.style.width = SCREEN_WIDTH + 'px';
  container.style.height = SCREEN_HEIGHT + 'px';
  zivcontainer.appendChild(container);
  container.appendChild(canvas);
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;

  // EVENT LISTENERS
  document.addEventListener('keydown', onKeyPress, false);
  document.addEventListener('keyup', onKeyPress, false);
  container.addEventListener('click', onClicked, false);

  // level
  level = new Level(levelImage, context);

  charcontainer = document.createElement('div');
  charcontainer.className = 'charcontainer';
  charcontainer.style.width = SCREEN_WIDTH + 'px';
  charcontainer.style.height = SCREEN_HEIGHT + 'px';
  container.appendChild(charcontainer);

  // player character
  player = new Player(CELL_SIZE, CELL_SIZE, playerImage);
  charcontainer.appendChild(player.domElement);

  // ghost
  ghost = new Ghost(CELL_SIZE * 11, CELL_SIZE * 5, ghostImage);
  charcontainer.appendChild(ghost.domElement);

  infobg = document.createElement('div');
  infobg.id = 'infobg';
  infobg.className = 'info';
  infobg.style.width = SCREEN_WIDTH + 'px';
  infobg.style.height = SCREEN_HEIGHT + 'px';
  container.appendChild(infobg);
  info = document.createElement('div');
  info.id = 'info';
  info.className = 'info';
  info.style.width = '100%';
  container.appendChild(info);

  scoreContainer = document.createElement('div');
  scoreContainer.id = 'score';
  scoreContainer.style.width = SCREEN_WIDTH + 'px';
  zivcontainer.appendChild(scoreContainer);

  player.init();
  ghost.init();

  // if (Modernizr.touch) {
  //   isTouch = true;
  //   makeControls();
  // }

  showInfo("<a class='btn'>Let's kill some time</a>");
}

function run() {
  var newTime = new Date().getTime();
  var deltaTime = newTime - currentTime;
  currentTime = newTime;

  if (deltaTime > 25) {
    deltaTime = 25;
  }

  accumulator += deltaTime;

  while (accumulator >= dt) {
    accumulator -= dt;
    update();
  }
  render();
}

function update() {
  player.update();
  ghost.update();

  if (player.xp % CELL_SIZE == 0 && player.yp % CELL_SIZE == 0) {
    var cx = (player.row = player.xp / CELL_SIZE);
    var cy = (player.column = player.yp / CELL_SIZE);

    if (upDown && player.dirY > -1 && level.cellData[cx][cy - 1] != 0)
      player.moveUp();
    else if (downDown && player.dirY < 1 && level.cellData[cx][cy + 1] != 0)
      player.moveDown();
    else if (leftDown && player.dirX > -1 && level.cellData[cx - 1][cy] != 0)
      player.moveLeft();
    else if (rightDown && player.dirX < 1 && level.cellData[cx + 1][cy] != 0)
      player.moveRight();
    else if (player.dirX == 1 && level.cellData[cx + 1][cy] == 0)
      player.stopMovement();
    else if (player.dirX == -1 && level.cellData[cx - 1][cy] == 0)
      player.stopMovement();
    else if (player.dirY == 1 && level.cellData[cx][cy + 1] == 0)
      player.stopMovement();
    else if (player.dirY == -1 && level.cellData[cx][cy - 1] == 0)
      player.stopMovement();

    if (level.cellData[cx][cy] == 1) {
      level.pips[cx][cy].munch();
      level.cellData[cx][cy] = 2;
      ++score;
      document.getElementById('score').innerHTML =
        'SCORE: <span>' + score + '<span>';
      if (score == level.totalPips) {
        onGameOver(true);
      }
    }

    isSameRow = player.row == ghost.row;
    isSameColumn = player.column == ghost.column;
  } else {
    if (upDown && player.dirY != -1 && player.dirX == 0) player.moveUp();
    else if (downDown && player.dirY != 1 && player.dirX == 0)
      player.moveDown();
    else if (leftDown && player.dirX != -1 && player.dirY == 0)
      player.moveLeft();
    else if (rightDown && player.dirX != 1 && player.dirY == 0)
      player.moveRight();
  }

  if (ghost.xp % CELL_SIZE == 0 && ghost.yp % CELL_SIZE == 0) {
    updateGhost();

    isSameRow = player.row == ghost.row;
    isSameColumn = player.column == ghost.column;
  }

  if (isSameRow || isSameColumn) {
    var dx = Math.abs(player.xp - ghost.xp);
    var dy = Math.abs(player.yp - ghost.yp);
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < CELL_SIZE) {
      onGameOver(false);
    }
  }
}

function render() {
  player.render();
  ghost.render();
}

function updateGhost() {
  var playerCellX = player.row;
  var playerCellY = player.column;

  var playerChangedPos = playerCellX != lastX || playerCellY != lastY;
  lastX = playerCellX;
  lastY = playerCellY;

  var lastRow = ghost.row;
  var lastColumn = ghost.column;

  var cx = (ghost.row = ghost.xp / CELL_SIZE);
  var cy = (ghost.column = ghost.yp / CELL_SIZE);

  if (!ghost.chasing && (ghost.dirX != 0 || ghost.dirY != 0)) {
    var nextTileFree = false;

    if (ghost.dirY <= -1 && level.cellData[cx][cy - 1] != 0)
      nextTileFree = true;
    else if (ghost.dirY >= 1 && level.cellData[cx][cy + 1] != 0)
      nextTileFree = true;
    else if (ghost.dirX <= -1 && level.cellData[cx - 1][cy] != 0)
      nextTileFree = true;
    else if (ghost.dirX >= 1 && level.cellData[cx + 1][cy] != 0)
      nextTileFree = true;

    if (nextTileFree) return;
  }

  var nodes = [];

  if (level.cellData[cx + 1][cy] != 0) nodes.push([cx + 1, cy, 1, 0]);
  if (level.cellData[cx - 1][cy] != 0) nodes.push([cx - 1, cy, -1, 0]);
  if (level.cellData[cx][cy + 1] != 0) nodes.push([cx, cy + 1, 0, 1]);
  if (level.cellData[cx][cy - 1] != 0) nodes.push([cx, cy - 1, 0, -1]);

  if (nodes.length == 1) {
    ghost.dirX = nodes[0][2];
    ghost.dirY = nodes[0][3];
  } else if (!ghost.chasing) {
    var node = nodes[Math.floor(Math.random() * nodes.length)];
    ghost.dirX = node[2];
    ghost.dirY = node[3];
  } else {
    var smallest = Infinity;
    var node;

    var i = nodes.length;
    while (--i > -1) {
      var dx = Math.abs(playerCellX - nodes[i][0]);
      var dy = Math.abs(playerCellY - nodes[i][1]);
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (
        dist < smallest &&
        ((nodes[i][0] != lastRow && nodes[i][1] != lastColumn) ||
          playerChangedPos)
      ) {
        smallest = dist;
        node = nodes[i];
      }
    }

    if (node) {
      ghost.dirX = node[2];
      ghost.dirY = node[3];
    }
  }
}

function onGameOver(complete) {
  stopGame();

  var str;
  if (complete) {
    str =
      "<h1>YOU WIN!</h1><p>You get a free website!</p><p>ok, you don't really, but karma for winning</p><p><a class='btn'>" +
      (isTouch ? 'TOUCH' : 'CLICK') +
      ' TO PLAY AGAIN</a></p>';
  } else {
    str =
      "<h1>GAME OVER</h1><p><a class='btn'>" +
      (isTouch ? 'TOUCH' : 'CLICK') +
      ' TO RESTART<span></p>';
  }

  showInfo(str);
  container.addEventListener('click', onClicked, false);
  if (isTouch) container.addEventListener('touchstart', onClicked, false);
  container.style.cursor = 'pointer';
}

function resetGame() {
  score = 0;
  level.reset();
  player.reset();
  ghost.reset();
}

function showInfo(str) {
  if (str) {
    document.getElementById('info').innerHTML = str;
    info.style.top = (SCREEN_HEIGHT - info.offsetHeight) * 0.5 + 'px';
  }

  info.style.opacity = 1;
  infobg.style.opacity = 0.75;
}

function makeControls() {
  document.addEventListener(
    'touchmove',
    function(e) {
      e.preventDefault();
    },
    false
  );
  document.addEventListener(
    'touchstart',
    function(e) {
      e.preventDefault();
    },
    false
  );

  var w = 120;
  var h = 250;
  var space = 50;

  buttons = document.createElement('div');
  buttons.id = 'container';
  buttons.style.width = SCREEN_WIDTH + 'px';
  buttons.style.height = SCREEN_HEIGHT + 'px';
  zivcontainer.appendChild(buttons);

  var button;

  button = new KeyButton(SCREEN_WIDTH * 0.5 - w * 0.5 - w, h - 180);
  leftButton = button.domElement;
  leftButton.addEventListener('touchstart', onKeyPress, false);
  leftButton.addEventListener('touchend', onKeyPress, false);
  buttons.appendChild(leftButton);

  button = new KeyButton(SCREEN_WIDTH * 0.5 + w * 0.5, h - 180);
  rightButton = button.domElement;
  rightButton.addEventListener('touchstart', onKeyPress, false);
  rightButton.addEventListener('touchend', onKeyPress, false);
  buttons.appendChild(rightButton);

  button = new KeyButton((SCREEN_WIDTH - w) * 0.5, h - 240);
  upButton = button.domElement;
  upButton.addEventListener('touchstart', onKeyPress, false);
  upButton.addEventListener('touchend', onKeyPress, false);
  buttons.appendChild(upButton);

  button = new KeyButton((SCREEN_WIDTH - w) * 0.5, h - 120);
  downButton = button.domElement;
  downButton.addEventListener('touchstart', onKeyPress, false);
  downButton.addEventListener('touchend', onKeyPress, false);
  buttons.appendChild(downButton);

  container.addEventListener('touchstart', onClicked, false);
}

function onClicked(e) {
  // zivHead = document.getElementsByClassName('heading-404')[0];
  container.removeEventListener('click', onClicked, false);
  if (isTouch) container.removeEventListener('touchstart', onClicked, false);
  container.style.cursor = 'default';

  startGame();
  info.style.opacity = 0;
  infobg.style.opacity = 0;
  // zivHead.style.maxHeight = 0;
  // zivHead.style.opacity = 0;
}

function onKeyPress(e) {
  if (!isPlaying && !isKeyDown) onClicked();
  isKeyDown = isTouch ? e.type == 'touchstart' : e.type == 'keydown';

  switch (isTouch ? e.target : e.keyCode) {
    case KEY_LEFT:
    case leftButton:
      leftDown = isKeyDown;
      break;

    case KEY_RIGHT:
    case rightButton:
      rightDown = isKeyDown;
      break;

    case KEY_UP:
    case upButton:
      upDown = isKeyDown;
      break;

    case KEY_DOWN:
    case downButton:
      downDown = isKeyDown;
      break;
  }
}

function startGame() {
  if (isPlaying) return;
  isPlaying = true;
  document.getElementById('score').innerHTML = 'SCORE: ' + score;
  resetGame();
  gameInterval = setInterval(run, 1);
}

function stopGame() {
  isPlaying = false;
  clearInterval(gameInterval);
}

window.onload = function() {
  setTimeout(() => {
    init();
  }, 1000);
};
