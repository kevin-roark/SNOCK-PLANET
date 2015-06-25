
var SheenModel = require('./sheen-model.js');
var loader = require('./model-loader');

module.exports = Avatar;

var Super = SheenModel.prototype;
Avatar.prototype = Object.create(Super);

function Avatar(options) {
  this.twitching = false;
  this.sleeping = false;

  SheenModel.call(this, options);
}

Avatar.prototype.loadMesh = function(callback) {
  var self = this;

  this.faceGeometry = new THREE.BoxGeometry(2, 2, 2);
  this.faceMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
  this.faceMesh = new THREE.Mesh(this.faceGeometry, this.faceMaterial);

  loader('/javascripts/3d_models/body.js', function (geometry, materials) {
    self.geometry = geometry;
    self.materials = materials;

    self.mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));

    self.mesh.scale.set(self.scale, self.scale, self.scale);
    self.faceMesh.scale.set(self.scale / 2, self.scale / 2, self.scale / 2);
    self.meshes = [self.mesh, self.faceMesh];

    if (callback) callback();
  });
};

Avatar.prototype.meshDidLoad = function() {
  Super.meshDidLoad.call(this);

  this.updateSkinColor(this.color);

  this.updateFaceImage(this.faceImageUrl);

  if (this.sleeping) {
    this.updateMeshForSleeping();
  }
};

Avatar.prototype.move = function(x, y, z) {
  Super.move.call(this, x, y, z);

  if (!this.hasLoadedMesh) return;

  this.faceMesh.position.x = this.mesh.position.x;
  this.faceMesh.position.z = this.mesh.position.z;
  this.faceMesh.position.y = this.mesh.position.y + 2.5 * this.scale;
};

Avatar.prototype.setScale = function(s) {
  this.mesh.scale.set(s, s, s);
  this.faceMesh.scale.set(s / 2, s / 2, s / 2);
};

Avatar.prototype.render = function() {
  if (this.twitching) {
    var x = (Math.random() - 0.5) * 2;
    var y = 0;
    var z = (Math.random() - 0.5) * 2;
    this.move(x, y, z);

    var rx = (Math.random() - 0.5) * 0.0001;
    var ry = (Math.random() - 0.5) * 0.4;
    var rz = (Math.random() - 0.5) * 0.0001;
    this.rotate(rx, ry, rz);
  }
};

Avatar.prototype.trackingMesh = function() {
  return this.faceMesh;
};

Avatar.prototype.wakeUp = function() {
  this.updateSleepState(false);
};

Avatar.prototype.goSleep = function() {
  this.updateSleepState(true);
};

Avatar.prototype.updateSkinColor = function(hex) {
  this.color = hex;

  if (!this.hasLoadedMesh) return;

  var materials = this.mesh.material.materials;
  for (var i = 0; i < materials.length; i++) {
    var material = materials[i];
    material.color = new THREE.Color(hex);
    material.ambient = new THREE.Color(hex);
    material.emissive = new THREE.Color(hex);
    material.needsUpdate = true;
  }
};

Avatar.prototype.updateFaceImage = function(image) {
  // var texture;
  //
  // if (typeof image === 'string' && image.length > 0) {
  //   this.faceImageUrl = image;
  //   texture = THREE.ImageUtils.loadTexture(image);
  // } else if (image) {
  //   // gotta assume its a texturable image object thing (ie canvas)
  //   this.faceImageCanvas = image;
  //   texture = new THREE.Texture(image);
  // }
  //
  // if (texture && this.hasLoadedMesh) {
  //   texture.needsUpdate = true;
  //   this.faceMaterial.map = texture;
  //   this.faceMaterial.needsUpdate = true;
  // }
};

Avatar.prototype.updateSleepState = function(sleeping) {
  if (sleeping === this.sleeping) {
    return;
  }

  this.sleeping = sleeping;

  if (this.hasLoadedMesh) {
    this.updateMeshForSleeping();
  }
};

Avatar.prototype.updateMeshForSleeping = function() {
  if (this.sleeping) {
    this.moveTo(this.mesh.position.x, -10, this.mesh.position.y);
    this.rotate(Math.PI / 2, 0, 0);
  } else {
    this.moveTo(this.mesh.position.x, 0, this.mesh.position.y);
    this.rotate(-Math.PI / 2, 0, 0);
  }
};

Avatar.prototype.serialize = function() {
  var data = Super.serialize.call(this);

  data.name = this.name;
  data.color = this.color;
  data.faceImageUrl = this.faceImageUrl;
  data.currentDoor = this.currentDoor? this.currentDoor._id : null;
  data.sleeping = this.sleeping;

  return data;
};

Avatar.prototype.updateFromModel = function(avatarData) {
  Super.updateFromModel.call(this, avatarData);

  if (!avatarData) avatarData = {};

  this.name = avatarData.name || 'nameless_fuck';
  this.updateSkinColor(avatarData.color || '#000000');
  this.updateFaceImage(avatarData.faceImageUrl);
  this.updateSleepState(avatarData.sleeping || false);

  if (avatarData.position) {
    //this.moveTo(avatarData.position);
  }
};

Avatar.prototype.uploadableFaceImageData = function() {
  if (!this.faceImageCanvas || !this.faceImageCanvas.toDataURL) return null;

  return this.faceImageCanvas.toDataURL('image/jpeg', 0.7);
};
