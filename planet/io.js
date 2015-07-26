
// requirements
var Avatar = require('./models').Avatar;
var socketIO = require('socket.io');
var socketIORedis = require('socket.io-redis');
var redis = require('./redis');
var db = require('./db');

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

/// REDIS ZONE

var redisSubscriber = redis.createClient();
redisSubscriber.on('message', function(channel, message) {
  if (message === 'clearLocalState') {
    clearLocalAvatars();
  }
});
redisSubscriber.subscribe('planet');

var redisClient = redis.createClient();

function updateRedisAvatars() {
  var avatarsJSON = JSON.stringify(avatars);
  redisClient.hset('planet:updated-avatars', uid, avatarsJSON);
}

function clearLocalAvatars() {
  avatars = {}; // likely called after aggregator gets global state
}

/// Socket.IO ZONE

io.on('connection', function(socket) {

  socket.on('avatar-update', avatarUpdate);

  socket.on('get-avatar', db.getAvatar);
  socket.on('create-avatar', db.createAvatar);
  socket.on('get-avatars-in-door', db.getAvatarsInDoor);

  socket.on('get-door', db.getDoor);
  socket.on('create-door', function createDoor(doorData, callback) {
    db.createDoor(doorData, function(door) {
      if (callback) callback(door);
      if (door) io.emit('door-created', door);
    });
  });
  socket.on('get-doors', db.getDoors);

  socket.on('create-note', function createNote(noteData, callback) {
    db.createNote(noteData, function(note) {
      if (callback) callback(note);
      if (note) io.emit('note-created', note);
    });
  });
  socket.on('get-notes', db.getNotes);

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

  updateRedisAvatars();
};
avatarUpdate();
