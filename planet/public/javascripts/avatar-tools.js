
var globals = require('./global-state');

var socket;

module.exports.makeAvatarFromServer = function(avatarData) {

};

module.exports.fetchAvatar = function(name, callback) {
  if (!fetchSocket() || !name) {
    callback(null);
    return;
  }

  socket.emit('get-avatar', name, function(avatarData) {
    callback(avatarData);
  });
};

module.exports.createAvatar = function(avatarData, callback) {
  if (!fetchSocket() || !avatarData.name) {
    callback(null);
    return;
  }

  if (!avatarData.color) avatarData.color = '#ffffff';

  socket.emit('create-avatar', avatarData, function(avatar) {
    callback(avatar);
  });
};

// Utility

function fetchSocket() {
  if (!socket) {
    socket = globals.io;
  }

  return socket;
}
