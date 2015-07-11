
var redis = require('./redis');
var socketIOEmitter = require('socket.io-emitter');
var planetState = require('./planet-state');

var redisClient = redis.createClient();
var io = socketIOEmitter(redisClient, {key: 'planet'});

console.log("\nEmitter is ready to emit for u ...");

setInterval(function() {
  planetState.getState(function(state) {
    io.emit('avatars-state', state);
  });
}, 7777);
