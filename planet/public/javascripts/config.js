
var debug = true;

var mongo_url, door_texture, io_url;

if (debug) {
  mongo_url = 'mongodb://localhost/test';

  door_texture = '/images/wooden_door.jpg';

  io_url = 'http://localhost:3000';
} else {

}

module.exports.mongo_url = mongo_url;
module.exports.door_texture = door_texture;
module.exports.io_url = io_url;

module.exports.testing = true;

module.exports.addTestDoor = false;
