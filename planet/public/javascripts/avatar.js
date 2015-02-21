
// requirements
var kt = require('./lib/kutility');
var loader = require('./model-loader');

module.exports = Avatar;

function Avatar(options) {
  this.name = options.name || 'default';

  if (!options.position) options.position = {};
  this.initX = options.position.x || 0;
  this.initY = options.position.y || 0;
  this.initZ = options.position.z || 0;

  this.postLoadBehaviors = [];

  this.scale = options.scale || 2;

  this.color = options.color || '#000000';

  this.twitching = false;

  this.faceImageUrl = options.faceImageUrl || '';
  this.faceGeometry = new THREE.BoxGeometry(2, 2, 2);
  this.faceMaterial = new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture(this.faceImageUrl)
  });
  this.faceMesh = new THREE.Mesh(this.faceGeometry, this.faceMaterial);
}

Avatar.prototype.addTo = function(scene) {
  var self = this;

  loader('/javascripts/3d_models/body.js', function (geometry, materials) {
    self.geometry = geometry;
    self.materials = materials;

    self.skinnedMesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));

    self.skinnedMesh.scale.set(self.scale, self.scale, self.scale);
    self.faceMesh.scale.set(self.scale / 2, self.scale / 2, self.scale / 2);

    self.updateSkinColor(self.color);

    self.move(self.initX, self.initY, self.initZ);

    scene.add(self.skinnedMesh);
    scene.add(self.faceMesh);

    for (var i = 0; i < self.postLoadBehaviors.length; i++) {
      self.postLoadBehaviors[i]();
    }
  });
};

Avatar.prototype.move = function(x, y, z) {
  if (!this.skinnedMesh) return;

  this.skinnedMesh.position.x += x;
  this.skinnedMesh.position.y += y;
  this.skinnedMesh.position.z += z;

  this.faceMesh.position.x = this.skinnedMesh.position.x;
  this.faceMesh.position.z = this.skinnedMesh.position.z;
  this.faceMesh.position.y = this.skinnedMesh.position.y + 2.5 * this.scale;
};

Avatar.prototype.rotate = function(rx, ry, rz) {
  if (!this.skinnedMesh) return;

  this.skinnedMesh.rotation.x += rx;
  this.skinnedMesh.rotation.y += ry;
  this.skinnedMesh.rotation.z += rz;

  this.faceMesh.rotation.copy(this.skinnedMesh.rotation);
};

Avatar.prototype.rotateTo = function(x, y, z) {
  if (!this.skinnedMesh) {
    var self = this;
    this.postLoadBehaviors.push(function() {
      self.rotateTo(x, y, z);
    });
    return;
  }

  this.skinnedMesh.rotation.set(x, y, z);
  this.rotate(0, 0, 0);
};

Avatar.prototype.moveTo = function(x, y, z) {
  if (!this.skinnedMesh) return;

  this.skinnedMesh.position.set(x, y, z);
  this.move(0, 0, 0);
};

Avatar.prototype.setScale = function(s) {
  this.skinnedMesh.scale.set(s, s, s);
  this.faceMesh.scale.set(s / 2, s / 2, s / 2);
};

Avatar.prototype.setVisible = function(visible) {
  this.skinnedMesh.visible = visible;
  this.faceMesh.visible = visible;
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

Avatar.prototype.wakeUp = function() {

};

Avatar.prototype.goSleep = function() {

};

Avatar.prototype.updateSkinColor = function(hex) {
  this.color = hex;

  if (!this.skinnedMesh) return;

  var materials = this.skinnedMesh.material.materials;
  for (var i = 0; i < materials.length; i++) {
    var material = materials[i];
    material.color = new THREE.Color(hex);
    material.ambient = new THREE.Color(hex);
    material.emissive = new THREE.Color(hex);
    material.needsUpdate = true;
  }
};

Avatar.prototype.updateFaceImage = function(image) {
  if (typeof image === 'string') {
    this.faceImageUrl = image;
  } else {
    // gotta assume its a texturable image object thing (ie canvas)
    var texture = new THREE.Texture(image);
    texture.needsUpdate = true;
    this.faceMaterial.map = texture;
    this.faceMaterial.needsUpdate = true;
  }
};

Avatar.prototype.serialize = function() {
  return {
    name: this.name,
    color: this.color,
    faceImageUrl: this.faceImageUrl
  }
};

Avatar.prototype.updateFromModel = function(avatarData) {
  this.name = avatarData.name;
  this.updateSkinColor(avatarData.color);
  this.updateFaceImage(avatarData.faceImageUrl);
};
