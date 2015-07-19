
var models = require('./models');
var Avatar = models.Avatar;
var redis = require('./redis');

var redisClient = redis.createClient();

module.exports.getState = function(callback) {
  calculateState(callback);
};

module.exports.clearState = function() {
  redisClient.publish('planet', 'clearLocalState');
};

var calculateState = function(callback) {
  amalgamateAvatars(function(avatars) {
    if (!avatars) {
      callback(null);
      return;
    }

    var awakeCount = 0;

    for (var i = 0; i < avatars.length; i++) {
      var avatar = avatars[i];

      if (!avatar.sleeping) {
        awakeCount += 1;
      }
    }

    callback({avatars: avatars, awakeCount: awakeCount});
  });
};

var amalgamateAvatars = function(callback) {
  redisClient.hgetall('planet:updated-avatars', function(err, avatarMapsMap) {
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
