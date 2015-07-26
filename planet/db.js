
// Requirements
var models = require('./models');
var Avatar = models.Avatar;
var Door = models.Door;
var Note = models.Note;
var sanitize = require('sanitize-html');

// Public Database Calls

var getAvatar = module.exports.getAvatar = function(name, callback) {
  getModel(Avatar, {'name': name}, callback);
};

module.exports.createAvatar = function(avatarData, callback) {
  getAvatar(avatarData.name, function(existingAvatar) {
    if (existingAvatar) {
      if (callback) callback({error: 'avatar with that name exists. pick another.'});
      return;
    }

    createModel(Avatar, avatarData, callback);
  });
};

module.exports.getAvatarsInDoor = function(doorID, callback) {
  getModels(Avatar, {'currentDoor': doorID}, callback);
};

module.exports.getDoor = function(subject, callback) {
  getModel(Door, {'subject': subject}, callback);
};

module.exports.createDoor = function(doorData, callback) {
  createModel(Door, doorData, callback);
};

module.exports.getDoors = function(queryData, callback) {
  getModels(Door, {}, callback);
};

module.exports.createNote = function(noteData, callback) {
  noteData.text = sanitize(noteData.text);

  createModel(Note, noteData, callback);
};

module.exports.getNotes = function(doorID, callback) {
  getModels(Note, {'door': doorID}, callback);
};

// Generic mongoose function wrappers

var getModel = function(Model, queryData, callback) {
  Model.findOne(queryData, function(err, model) {
    if (err) {
      console.log('error finding ' + Model.modelName + ':');
      console.log(err);
      if (callback) callback(null);
    } else {
      if (callback) callback(model);
    }
  });
};

var getModels = function(Model, queryData, callback) {
  Model.find(queryData, function(err, models) {
    if (err) {
      console.log('error getting ' + Model.modelName + 's:');
      console.log(err);
      if (callback) callback(null);
    } else {
      if (callback) callback(models);
    }
  });
};

var createModel = function(Model, modelData, callback) {
  var model = new Model(modelData);
  model.save(function(err) {
    if (err) {
      console.log('error creating ' + Model.modelName + ':');
      console.log(err);
      if (callback) callback(null);
    } else {
      if (callback) callback(model);
    }
  });
};
