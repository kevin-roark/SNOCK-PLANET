
// requirements
var models = require('./models');
var Avatar = models.Avatar;
var Door = models.Door;

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

    socket.on('get-thread', getThread);
    socket.on('create-thread', createThread);

    socket.on('get-doors', getDoors);

  });

  app.server_ = server;
};

var getAvatar = function(name, callback) {
  getModel(Avatar, 'name', name, 'avatar', callback);
};

var createAvatar = function(avatarData, callback) {
  createModel(Avatar, avatarData, 'avatar', callback);
};

var getThread = function(subject, callback) {
  getModel(Door, 'subject', subject, 'door', callback);
};

var createThread = function(threadData, callback) {
  createModel(Door, threadData, 'door', callback);
};

var getDoors = function(queryData, callback) {
  // TODO: incorporate query data. Obviously cannot return all doors forever ...

  Door.find({}, function(err, users) {
    if (err) {
      console.log('error fetching door query:');
      console.log(err);
      callback(null);
    } else {
      callback(users);
    }
  });
};

var getModel = function(Model, key, value, modelName, callback) {
  var data = {};
  data[key] = value;

  Model.findOne(data, function(err, model) {
    if (err) {
      console.log('error finding ' + modelName + ':');
      console.log(err);
      callback(null);
    } else {
      callback(model);
    }
  });
};

var createModel = function(Model, modelData, modelName, callback) {
  var model = new Model(modelData);
  model.save(function(err) {
    if (err) {
      console.log('error creating ' + modelName + ':');
      console.log(err);
      callback(null);
    } else {
      callback(model);
    }
  });
};
