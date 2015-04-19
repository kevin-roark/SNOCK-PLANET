
// requirements
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('./public/javascripts/config');

mongoose.connect(config.mongo_url);

// schemas

var Position = {
  x: Number,
  z: Number
};

var doorSchema = Schema({
  subject: {type: String, trim: true},
  when: {type: Date, default: Date.now},
  texture: String,
  skyboxTexture: String,
  creator: {type: Schema.Types.ObjectId, ref: 'Avatar'},
  position: Position
});

var noteSchema = Schema({
  text: {type: String, trim: true},
  when: {type: Date, default: Date.now},
  accentTexture: String,
  depth: Number,
  door: {type: Schema.Types.ObjectId, ref: 'Door'},
  creator: {type: Schema.Types.ObjectId, ref: 'Avatar'},
  position: Position
});

var avatarSchema = Schema({
  name: String,
  color: String,
  position: Position,
  faceImageUrl: String,
  currentDoor: {type: Schema.Types.ObjectId, ref: 'Door'}
});

// models

var Door = module.exports.Door = mongoose.model('Door', doorSchema);
var Note = module.exports.Note = mongoose.model('Note', noteSchema);
var Avatar = module.exports.Avatar = mongoose.model('Avatar', avatarSchema);
