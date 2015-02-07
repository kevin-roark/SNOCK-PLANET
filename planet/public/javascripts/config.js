
var debug = true;

var mongo_url, door_texture;

if (debug) {
  mongo_url = 'mongodb://localhost/test';

  door_texture = '/public/images/wooden_door.jpg';
} else {

}

module.exports.mongo_url = mongo_url;
