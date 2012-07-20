var TurnGame = module.exports = function (width, height) {
  this.width = width;
  this.height= height;
  this.board = new Array(width * height);
  for (var i = 0; i < width*height; i++) {
    this.board[i] = "0xccc";
  }
  this.players = [];
  this.started = false;
  //this.currentPlayerTurn = -1;
  return this;
}

TurnGame.prototype.addPlayer = function(name) {
  if (this.started) {
    throw { message: 'the game has already started!' };
  }

  var color = ['#f00', '#0f0', '#00f'][this.players.length];

  var player = {
    playerId: this.players.length,
    color: color,
    name: name,
    moves: []
  };
  this.players.push(player);

  return player.playerId;
}

TurnGame.prototype.startGame = function() {
  if (this.players.length < 1) {
    throw { message: 'at least one player is needed to play' };
  }

  if (this.started) {
    throw { message: 'the game has already started' };
  }

  //this.currentPlayerTurn = 0;
  this.started = true;
}

TurnGame.prototype.takeTurn = function(playerId, x, y) {
  if (!this.started) {
    throw { message: 'the game has not started' };
  }

  if (playerId == -1) {
    throw { message: 'you are not in this game' };
  }
/*
  if (this.currentPlayerTurn != playerId) {
    throw { message: 'it is not your turn' };
  }
*/
  if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
    throw { message: 'that is an invalid move' };
  }
/*
  if (this.getSquare(x, y) != -1) {
    throw { message: 'that square is already taken' };
  }
*/
  //this.setSquare(playerId, x, y);

  var player = this.players[playerId];
  player.moves.push({color: player.color, x:x, y:y});
/*
  this.currentPlayerTurn++;
  if (this.currentPlayerTurn >= this.players.length) {
    this.currentPlayerTurn = 0;
  }
  */
}

TurnGame.prototype.turn = function() {
  var updates = [];

  //random computer move
  var x = Math.floor(Math.random() * this.width);
  var y = Math.floor(Math.random() * this.height);
  var color = "#" + Math.floor(Math.random() * 4096).toString(16);
  this.setSquareColor(color, x, y);

  updates.push({color: color, x:x, y:y});

  //process all players
  for (var i = 0; i < this.players.length; i++) {
    var p = this.players[i];
    if (p.moves.length > 0) {
      var move = p.moves.shift();
      move.color = p.color;
      this.setSquareColor(move.color, move.x, move.y);
      updates.push(move);
    }
  }

  return updates;
}

TurnGame.prototype.getSquare = function (x, y) {
  return this.board[ y * this.width + x ];
}

TurnGame.prototype.setSquarePlayer = function(playerId, x, y) {
  this.setSquareColor(this.players[playerId].color, x, y);
}

TurnGame.prototype.setSquareColor = function(color, x, y) {
  this.board[ y * this.width + x ] = color;
}