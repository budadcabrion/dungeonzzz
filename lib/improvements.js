var socket = require('socket.io');

exports.improve = function() {
	//i want full fucking broadcast god damn it
	socket.Socket.prototype.packet_old = socket.Socket.prototype.packet;

	socket.Socket.prototype.packet = function (packet) {
	  if (this.flags.everybody) {
	    this.log.debug('everybody getting packet');
	    this.namespace.in(this.flags.room).packet(packet);
	    this.flags.everybody = false;
	  }
	  else {
	    this.packet_old(packet);
	  }

	  return this;
	};

	socket.Socket.prototype.__defineGetter__('everybody', function () {
	  this.flags.everybody = true;
	  return this;
	});
}