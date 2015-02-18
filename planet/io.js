
// requirements
var models = require('./models');
var Avatar = models.Avatar;

// constants
var IO_PORT = 3000;

// globals
var io;

module.exports.init = function(app) {
  var server = require('http').createServer(app);
  io = require('socket.io')(server);

  io.on('connection', function(socket) {

    socket.on('get-avatar', getAvatar);
    socket.on('create-avatar', createAvatar);

  });

  app.server_ = server;
};

var getAvatar = function(name, callback) {
  Avatar.findOne({name: name}, function(err, avatar) {
    if (err) {
      console.log('error finding avatar:');
      console.log(err);
      callback(null);
    } else {
      callback(avatar);
    }
  });
};

var createAvatar = function(avatarData, callback) {
  var avatar = new Avatar(avatarData);
  avatar.save(function(err) {
    if (err) {
      console.log('error creating avatar:');
      console.log(err);
      callback(null);
    } else {
      callback(avatar);
    }
  });
};
