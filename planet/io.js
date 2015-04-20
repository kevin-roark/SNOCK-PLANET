
// requirements
var models = require('./models');
var Avatar = models.Avatar;
var Door = models.Door;
var Note = models.Note;
var planetState = require('./planet-state');

// constants
var IO_PORT = 3000;

// globals
var io;

module.exports.init = function(app) {
  var server = require('http').createServer(app);
  io = require('socket.io')(server);

  io.on('connection', function(socket) {

    socket.on('avatar-update', avatarUpdate);

    socket.on('get-avatar', getAvatar);
    socket.on('create-avatar', createAvatar);
    socket.on('get-avatars-in-door', getAvatarsInDoor);

    socket.on('get-door', getDoor);
    socket.on('create-door', createDoor);
    socket.on('get-doors', getDoors);

    socket.on('create-note', createNote);
    socket.on('get-notes', getNotes);

    var stateInterval = setInterval(function() {
      planetState.getState(function(state) {
        io.emit('avatars-state', state);
      });
    }, 7777);

  });

  app.server_ = server;
};

// API Method Implementations

var avatarUpdate = function(avatarData) {
  planetState.avatarUpdate(avatarData);
};

var getAvatar = function(name, callback) {
  getModel(Avatar, {'name': name}, callback);
};

var createAvatar = function(avatarData, callback) {
  createModel(Avatar, avatarData, callback);
};

var getAvatarsInDoor = function(doorID, callback) {
  getModels(Avatar, {'currentDoor': doorID}, callback);
};

var getDoor = function(subject, callback) {
  getModel(Door, {'subject': subject}, callback);
};

var createDoor = function(doorData, callback) {
  createModel(Door, doorData, function(door) {
    callback(door);

    if (door) {
      io.emit('door-created', door);
    }
  });
};

var getDoors = function(queryData, callback) {
  // TODO: incorporate query data. Obviously cannot return all doors forever ...
  getModels(Door, {}, callback);
};

var createNote = function(noteData, callback) {
  createModel(Note, noteData, function(note) {
    callback(note);

    if (note) {
      io.emit('note-created', note);
    }
  });
};

var getNotes = function(doorID, callback) {
  getModels(Note, {'door': doorID}, callback);
};

// Generic mongoose function wrappers

var getModel = function(Model, queryData, callback) {
  Model.findOne(queryData, function(err, model) {
    if (err) {
      console.log('error finding ' + Model.modelName + ':');
      console.log(err);
      callback(null);
    } else {
      callback(model);
    }
  });
};

var getModels = function(Model, queryData, callback) {
  Model.find(queryData, function(err, models) {
    if (err) {
      console.log('error getting ' + Model.modelName + 's:');
      console.log(err);
      callback(null);
    } else {
      callback(models);
    }
  });
};

var createModel = function(Model, modelData, callback) {
  var model = new Model(modelData);
  model.save(function(err) {
    if (err) {
      console.log('error creating ' + Model.modelName + ':');
      console.log(err);
      callback(null);
    } else {
      callback(model);
    }
  });
};
