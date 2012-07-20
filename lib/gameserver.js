var http = require('http')
  , socket = require('socket.io')
  , fs = require('fs')
  , url = require('url')
  , TurnGame = require('./turngame')

var GameServer = module.exports = function() {

  this.game = new TurnGame(9, 11);
  this.server = http.createServer(this.handler.bind(this));
  this.io = socket.listen(this.server);

  this.initSocket();
  this.server.listen(8000);
  return this;
}

GameServer.prototype.handler = function (req, res) {
  var path = url.parse(req.url).pathname;
  if (path == '/') path = '/index.html';

  fs.readFile(process.cwd() + '/public' + path,
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + path);
      }

      res.writeHead(200);
      res.end(data);
    }
  );
}

GameServer.prototype.initSocket = function() {
  var io = this.io;
  var game = this.game;
  var gameserver = this;

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