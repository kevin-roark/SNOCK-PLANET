
var debug = (typeof window !== 'undefined') ? window.serverConfig.isDebug : process.env.NODE_ENV === 'development';
module.exports.isDebug = debug;

// Paths and such
module.exports.mongo_url = debug ? 'mongodb://localhost/test' : 'mongodb://localhost/snockplanet';
module.exports.static_path = __dirname + '/..';

// Door Textures
module.exports.door_textures = {
  wood: '/images/wooden_door.jpg',
  metal: '/images/metal_door.jpg',
  neon: '/images/neon_door.jpg',
  rainbow: '/images/rainbow_door.jpg'
};

// Skybox Textures
module.exports.room_textures = {
  girl: '/images/girl_room.jpg',
  farm: '/images/farm_room.jpg',
  factory: '/images/factory_room.jpg',
  space: '/images/space_room.jpg',
  underwater: '/images/underwater_room.jpg'
};

// Note Textures
module.exports.note_textures = {
  paper: '/images/paper_texture.jpg',
  tablet: '/images/stonetablet_texture.jpg',
  ipad: '/images/ipad_texture.jpg',
  googledocs: '/images/googledocs_texture.jpg',
  chalkboard: '/images/chalkboard_texture.jpg'
};

module.exports.randomTexture = function(textureMap) {
  var keys = Object.keys(textureMap);
  var randomKey = keys[Math.floor(Math.random() * keys.length)];
  var randomTexture = textureMap[randomKey];
  return randomTexture;
};
