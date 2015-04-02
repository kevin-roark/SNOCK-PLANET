
var debug = true;

// Paths and such
module.exports.mongo_url = debug? 'mongodb://localhost/test' : '';
module.exports.io_url = debug? 'http://localhost:3000' : '';
module.exports.static_path = __dirname + '/..';

// Testing
module.exports.testing = true;

// Door config
module.exports.door_texture = '/images/wooden_door.jpg';
module.exports.addTestDoor = false;

// Skybox config
module.exports.girl_room_texture = '/images/girl_room.jpg';

// Note config
module.exports.note_textures = {
  paper: '/images/paper_texture.jpg'
};
