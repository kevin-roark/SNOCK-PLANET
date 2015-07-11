
var models = require('./models');
var Avatar = models.Avatar;
var redis = require('./redis');

var redisClient = redis.createClient();

module.exports.getState = function(callback) {
  calculateState(callback);
};

var calculateState = function(callback) {
  amalgamateAvatars(function(avatars) {
    if (!avatars) {
      callback(null);
      return;
    }

    var planetAvatars = [];
    var avatarsInDoors = {};

    for (var i = 0; i < avatars.length; i++) {
      var avatar = avatars[i];
      var loc = avatar.currentDoor;
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

var amalgamateAvatars = function(callback) {
  redisClient.hgetall('planet:avatars', function(err, avatarMapsMap) {
    if (!avatarMapsMap) {
      if (err) {
        console.log('err getting redis avatars: ');
        console.log(err);
      }
      callback(null);
      return;
    }

    var allAvatarsMap = {};
    for (var uid in avatarMapsMap) {
      if (avatarMapsMap.hasOwnProperty(uid)) {
        var avatarMap = JSON.parse(avatarMapsMap[uid]);
        for (var idKey in avatarMap) {
          if (avatarMap.hasOwnProperty(idKey)) {
            allAvatarsMap[idKey] = avatarMap[idKey];
          }
        }
      }
    }

    var allAvatarsList = [];
    for (var _id in allAvatarsMap) {
      if (allAvatarsMap.hasOwnProperty(_id)) {
        allAvatarsList.push(allAvatarsMap[_id]);
      }
    }

    callback(allAvatarsList);
  });
};

/// Not currently used because I'm keeping optimistic copies of everything in redis 4 speed
var getAvatars = function(callback) {
  Avatar.find({}, function(err, avatars) {
    callback(avatars);
  });
};
