
var models = require('./models');
var Avatar = models.Avatar;

// TODO: this should probably move to redis.
var avatarLocations = {};

module.exports.avatarUpdate = function(avatarData) {
  var id = avatarData._id;

  var query = {_id: id};
  Avatar.update(query, avatarData, {}, function(err) {
    if (err) {
      console.log('err updating avatar: ');
      console.log(err);
    }
  });

  avatarLocations[id] = avatarData.currentDoor;
};

module.exports.getState = function(callback) {
  calculateState(callback);
};

var calculateState = function(callback) {
  getAvatars(function(avatars) {
    if (!avatars) {
      callback(null);
      return;
    }

    var planetAvatars = [];
    var avatarsInDoors = {};

    for (var i = 0; i < avatars.length; i++) {
      var avatar = avatars[i];
      var loc = avatarLocations[avatar._id];
      if (loc) {
        if (!avatarsInDoors[loc]) {
          avatarsInDoors[loc] = [];
        }
        avatarsInDoors[loc].push(avatar);
      } else {
        planetAvatars.push(avatar);
      }
    }

    callback({planet: planetAvatars, doors: avatarsInDoors});
  });
};


var getAvatars = function(callback) {
  Avatar.find({}, function(err, avatars) {
    callback(avatars);
  });
};
