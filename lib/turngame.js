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

  this.started = true;
}

TurnGame.prototype.takeTurn = function(playerId, x, y) {
  if (!this.started) {
    throw { message: 'the game has not started' };
  }

  if (playerId == -1) {
    throw { message: 'you are not in this game' };
  }

  if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
    throw { message: 'that is an invalid move' };
  }

  var player = this.players[playerId];
  player.moves.push({color: player.color, x:x, y:y});
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










TurnGame.prototype.initSockets = function(io) {

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

        setInterval(function() {
          console.log('TURN HAPPENING');
          var updates = game.turn();
          updates.forEach(function(move) {
            socket.everybody.emit('updatesquare', move.color, move.x, move.y);
          });
        }, 400);
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
      }
      catch (err) { error(err); }
    });
  });
}