
var SheenModel = require('./sheen-model');
var config = require('./config');

module.exports = Note;

var Super = SheenModel.prototype;
Note.prototype = Object.create(Super);

function Note(options) {
  SheenModel.call(this, options);
}

Note.prototype.updateFromModel = function(noteData) {
  Super.updateFromModel.call(this, noteData);

  this.text = noteData.text || '';
  this.when = noteData.when || new Date();
  this.door = noteData.door || null;
  this.creator = noteData.creator || null;
};

Note.prototype.loadMesh = function(callback) {
  this.material = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture(this.texture),
      reflectivity: 0.15
  });
  this.geometry = new THREE.BoxGeometry(8, 20, 0.5);
  this.geometry.center();
  this.mesh = new THREE.Mesh(this.geometry, this.material);

  this.createTextMesh();

  this.meshes = [this.mesh];

  if (callback) callback();
};

Note.prototype.serialize = function() {
  var data = Super.serialize.call(this);

  data.text = this.text;
  data.door = this.door;
  data.creator = this.creator;
  data.when = this.when;

  return data;
};
