
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

var letterSchema = Schema({
  text: {type: String, trim: true},
  when: {type: Date, default: Date.now},
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
var Letter = module.exports.Letter = mongoose.model('Letter', letterSchema);
var Avatar = module.exports.Avatar = mongoose.model('Avatar', avatarSchema);
