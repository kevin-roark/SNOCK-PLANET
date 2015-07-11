
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

module.exports.getAvatarsInDoor = function(doorID, callback) {
  if (!fetchSocket() || !doorID) {
    callback({error: 'i aint gonna do it'});
    return;
  }

  socket.emit('get-avatars-in-door', doorID, function(notes) {
    callback(notes);
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
      console.log('error uploading face:')
      console.log(res.err);
    }
    callback(res);
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

module.exports.getDoors = function(position, callback) {
  if (!fetchSocket() || !position) {
    callback({error: 'do better parameters'});
    return;
  }

  socket.emit('get-doors', {position: position}, function(doors) {
    callback(doors);
  });
};

module.exports.createNote = function(noteData, callback) {
  if (!fetchSocket() || !noteData || !noteData.text) {
    callback({error: 'bad call braaaaaa'});
    return;
  }

  socket.emit('create-note', noteData, function(note) {
    callback({note: note});
  });
};

module.exports.getNotes = function(doorID, callback) {
  if (!fetchSocket() || !doorID) {
    callback({error: 'i aint gonna do it'});
    return;
  }

  socket.emit('get-notes', doorID, function(notes) {
    callback(notes);
  });
};

// Utility

function fetchSocket() {
  if (!socket) {
    socket = globals.io;
  }

  return socket;
}
