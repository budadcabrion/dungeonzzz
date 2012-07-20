var improvements = require('./lib/improvements')
  , GameServer = require('./lib/gameserver')
  ;

improvements.improve();

var gameserver = new GameServer();

