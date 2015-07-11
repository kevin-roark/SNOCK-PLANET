
// requirements
var models = require('./models');
var Avatar = models.Avatar;
var Door = models.Door;
var Note = models.Note;
var socketIO = require('socket.io');
var socketIORedis = require('socket.io-redis');
var redis = require('./redis');

var port = process.env.PLANET_IO_PORT || 6001;
var uid = port;

// process-level local copy
var avatars = {};

// start socket.io
var io = socketIO(port);
console.log('io listening on *:' + port);

// set up redis socket.io adapter
var redisAdapter = socketIORedis(redis.uri, {key: 'planet'});
io.adapter(redisAdapter);

// set up redis client
var redisClient = redis.createClient();

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

});

/// API Method Implementations

var avatarUpdate = function(avatarData) {
  if (!avatarData) avatarData = {};
  var id = avatarData._id;

  if (id) {
    // update the database for longterm consistency
    var query = {_id: id};
    Avatar.update(query, avatarData, {}, function(err) {
      if (err) {
        console.log('err updating avatar: ');
        console.log(err);
      }
    });

    // update redis for current consistency
    avatars[id] = avatarData;
  }

  var avatarsJSON = JSON.stringify(avatars);
  redisClient.hset('planet:avatars', uid, avatarsJSON);
};
avatarUpdate();

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
