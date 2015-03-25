
// requirements
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('./public/javascripts/config');

mongoose.connect(config.mongo_url);

// schemas

var doorSchema = Schema({
  subject: {type: String, trim: true},
  when: {type: Date, default: Date.now},
  texture: String,
  creator: {type: Schema.Types.ObjectId, ref: 'Avatar'},
  position: {
    x: Number,
    z: Number
  }
});

var noteSchema = Schema({
  text: {type: String, trim: true},
  when: {type: Date, default: Date.now},
  skyboxTexture: String,
  door: {type: Schema.Types.ObjectId, ref: 'Door'},
  creator: {type: Schema.Types.ObjectId, ref: 'Avatar'},
  position: {
    x: Number,
    z: Number
  }
});

var avatarSchema = Schema({
  name: String,
  color: String,
  faceImageUrl: String
});

// models

var Door = module.exports.Door = mongoose.model('Door', doorSchema);
var Note = module.exports.Note = mongoose.model('Note', noteSchema);
var Avatar = module.exports.Avatar = mongoose.model('Avatar', avatarSchema);
