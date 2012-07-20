var http = require('http')
  , socket = require('socket.io')
  , fs = require('fs')
  , url = require('url')
  , Game = require('./gridgame')

var GameServer = module.exports = function() {

  this.game = new Game(9, 11);
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

  game.initSockets(io);

}