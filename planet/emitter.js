
var redis = require('./redis');
var socketIOEmitter = require('socket.io-emitter');
var planetState = require('./planet-state');

var redisClient = redis.createClient();
var io = socketIOEmitter(redisClient, {key: 'planet'});

console.log("\nEmitter is ready to emit for u ...");

setInterval(function() {
  planetState.getState(function(state) {
    io.emit('avatar-updates', state);

    // clear between calculations so that the state only feeds me updates (rather than *all* avatars)
    planetState.clearState();
  });
}, 7777);
