
var SheenModel = require('./sheen-model');
var config = require('./config');
var makeTextCanvas = require('./text-canvas');

module.exports = Note;

var Super = SheenModel.prototype;
Note.prototype = Object.create(Super);

function Note(options) {
  SheenModel.call(this, options);

  if (!this.initialPosition.y) {
    this.initialPosition.y = (Math.random() + 0.05) * 9 + 5;
  }
}

Note.prototype.updateFromModel = function(noteData) {
  Super.updateFromModel.call(this, noteData);

  this.text = noteData.text || '';
  this.when = noteData.when || new Date();
  this.depth = noteData.depth || (Math.random() + 0.05) * 15;
  this.accentTexture = noteData.accentTexture || config.randomTexture(config.note_textures);
  this.door = noteData.door || null;
  this.creator = noteData.creator || null;
};

Note.prototype.serialize = function() {
  var data = Super.serialize.call(this);

  data.text = this.text;
  data.when = this.when;
  data.accentTexture = this.accentTexture || config.randomTexture(config.note_textures);
  data.door = this.door;
  data.creator = this.creator;

  return data;
};

Note.prototype.loadMesh = function(callback) {
  this.canvas = makeTextCanvas({
    text: this.text
  });

  this.texture = new THREE.Texture(this.canvas);
  this.texture.minFilter = THREE.NearestFilter;
  this.texture.needsUpdate = true;

  // this.material === material wit tha words on it
  this.material = new THREE.MeshBasicMaterial({
    map: this.texture,
    side: THREE.DoubleSide
  });

  var accentTexture = new THREE.ImageUtils.loadTexture(this.accentTexture);
  accentTexture.wrapS = THREE.ClampToEdgeWrapping;
  accentTexture.wrapT = THREE.ClampToEdgeWrapping;
  accentTexture.minFilter = THREE.NearestFilter;

  this.accentMaterial = new THREE.MeshBasicMaterial({
    map: accentTexture,
    side: THREE.DoubleSide
  });

  var materials = [
    this.accentMaterial, this.accentMaterial.clone(), this.accentMaterial.clone(), this.accentMaterial.clone(),
    this.material, this.material.clone()
  ];

  this.meshFaceMaterial = new THREE.MeshFaceMaterial(materials);

  var scalar = 0.025;
  this.width = this.canvas.width * this.scale * scalar;
  this.height = this.canvas.height * this.scale * scalar;
  this.geometry = new THREE.BoxGeometry(this.width, this.height, this.depth * this.scale);

  this.mesh = new THREE.Mesh(this.geometry, this.meshFaceMaterial);
  this.mesh.doubleSided = true;

  this.meshes = [this.mesh];

  if (callback) callback();
};
