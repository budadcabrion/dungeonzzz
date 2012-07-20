var GridGame = module.exports = function (width, height) {
  this.width = width;
  this.height= height;
  this.board = new Array(width * height);
  for (var i = 0; i < width*height; i++) {
    this.board[i] = -1;
  }
  this.players = [];
  this.started = false;
  this.currentPlayerTurn = -1;
  return this;
}

GridGame.prototype.addPlayer = function(name) {
  if (this.started) {
    throw { message: 'the game has already started!' };
  }

  var player = {
    playerId: this.players.length,
    name: name
  };
  this.players.push(player);

  return player.playerId;
}

GridGame.prototype.startGame = function() {
  if (this.players.length < 2) {
    throw { message: 'at least two players are needed to play' };
  }

  if (this.started) {
    throw { message: 'the game has already started' };
  }

  this.currentPlayerTurn = 0;
  this.started = true;
}

GridGame.prototype.takeTurn = function(playerId, x, y) {
  if (!this.started) {
    throw { message: 'the game has not started' };
  }

  if (playerId == -1) {
    throw { message: 'you are not in this game' };
  }

  if (this.currentPlayerTurn != playerId) {
    throw { message: 'it is not your turn' };
  }

  if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
    throw { message: 'that is an invalid move' };
  }

  if (this.getSquare(x, y) != -1) {
    throw { message: 'that square is already taken' };
  }

  this.setSquare(playerId, x, y);

  this.currentPlayerTurn++;
  if (this.currentPlayerTurn >= this.players.length) {
    this.currentPlayerTurn = 0;
  }
}

GridGame.prototype.getSquare = function (x, y) {
  return this.board[ y * this.width + x ];
}

GridGame.prototype.setSquare = function(playerId, x, y) {
  this.board[ y * this.width + x ] = playerId;
}










GridGame.prototype.initSockets = function(io) {

  var game = this;

  io.sockets.on('connection', function (socket) {
    socket.playerId = -1;

    function error(err) {
      console.log('error: ' + err.message);
      socket.emit('error', err);
    }

    function emitfullupdate() {
      socket.everybody.emit('fullupdate', game.width, game.height, game.board);
    }

    socket.on('join', function (name, fn) {
      console.log('join received');

      if (socket.playerId != -1) {
        error({ message: 'you have already joined' });
        return;
      }

      try {
        var playerId = game.addPlayer(name);
        socket.playerId = playerId;

        fn(playerId, name);
        socket.everybody.emit('joined', playerId, name)
      }
      catch (err) { error(err); } 
    });

    socket.on('startgame', function() {
      console.log('startgame received')
      try {
        game.startGame();
        socket.everybody.emit('gamestarted');
        emitfullupdate();
      }
      catch (err) { error(err); } 
    });

    socket.on('requestupdate', function() {
      emitfullupdate();
    });

    socket.on('taketurn', function(x, y) {
      console.log('taketurn received ', x, y);
      x = parseInt(x);
      y = parseInt(y);
      try {
        game.takeTurn(socket.playerId, x, y);
        socket.everybody.emit('updatesquare', socket.playerId, x, y);
      }
      catch (err) { error(err); }
    });
  });
}