
var redis = require('redis');

var uri = process.env.PLANET_REDIS_URI || 'localhost:6379';
module.exports.uri = uri;

var pieces = uri.split(':');

module.exports.createClient = function() {
  return redis.createClient(pieces[1], pieces[0], {return_buffers: true});
};
