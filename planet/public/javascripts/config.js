
var debug = true;

var mongo_url, door_texture, io_url, static_path;

if (debug) {
  mongo_url = 'mongodb://localhost/test';

  door_texture = '/images/wooden_door.jpg';

  io_url = 'http://localhost:3000';

  static_path = __dirname + '/..';
} else {

}

module.exports.mongo_url = mongo_url;
module.exports.door_texture = door_texture;
module.exports.io_url = io_url;
module.exports.static_path = static_path;

module.exports.testing = true;

module.exports.addTestDoor = false;
