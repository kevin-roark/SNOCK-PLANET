
var globals = require('./global-state');
var $ = require('jquery');

var socket;

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

module.exports.createDoor = function(doorData, callback) {
  if (!fetchSocket() || !doorData || !doorData.subject) {
    callback({error: 'bad call brah'});
    return;
  }

  socket.emit('get-door', doorData.subject, function(door) {
    if (door) {
      callback({door: door, error: 'door exists'});
    } else {
      socket.emit('create-door', doorData, function(door) {
        callback({door: door});
      });
    }
  });
};

module.exports.createNote = function(noteData, callback) {
  if (!fetchSocket() || !noteData || !noteData.text) {
    callback({erorr: 'bad call braaaaaa'});
    return;
  }

  socket.emit('create-note', noteData, function(note) {
    callback({note: note});
  });
};

// Utility

function fetchSocket() {
  if (!socket) {
    socket = globals.io;
  }

  return socket;
}
