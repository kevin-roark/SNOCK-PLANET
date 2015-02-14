
// requirements

// constants
var IO_PORT = 3000;

// globals
var io;

module.exports.init = function(app) {
  var server = require('http').createServer(app);
  io = require('socket.io')(server);

  io.on('connection', function(socket) {
    socket.on('get-avatar', function(name, callback) {
      callback(null);
    });
  });

  app.server_ = server;
};
