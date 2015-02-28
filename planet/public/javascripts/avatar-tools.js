
var globals = require('./global-state');
var $ = require('jquery');

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

module.exports.createFaceURL = function(faceData, callback) {
  if (!faceData) {
    callback(null);
    return;
  }

  $.post('/upload-face-image', {
      imgBase64: faceData
  }, function(res) {
    if (res.err) {
      console.log(res.err);
    }
    callback(res.imageURL);
  });
};

// Utility

function fetchSocket() {
  if (!socket) {
    socket = globals.io;
  }

  return socket;
}
