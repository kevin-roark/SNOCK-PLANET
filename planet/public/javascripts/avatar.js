
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

  this.scale = options.scale || 2;

  this.twitching = false;

  this.faceImage = options.faceImage || '';
  this.faceGeometry = new THREE.BoxGeometry(2, 2, 2);
  this.faceMaterial = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture(this.faceImage),
      reflectivity: 0.15
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

    self.move(self.initX, self.initY, self.initZ);

    scene.add(self.skinnedMesh);
    scene.add(self.faceMesh);
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

  this.faceMesh.rotation = this.skinnedMesh.rotation;
};

Avatar.prototype.moveTo = function(x, y, z) {
  if (!this.skinnedMesh) return;

  this.skinnedMesh.position.x = x;
  this.skinnedMesh.position.y = y;
  this.skinnedMesh.position.z = z;

  this.move(0, 0, 0);
};

Avatar.prototype.setScale = function(s) {
  this.skinnedMesh.scale.set(s, s, s);
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

Avatar.prototype.wakeUp = function() {

};

Avatar.prototype.goSleep = function() {

};

Avatar.prototype.updateSkinColor = function(hex) {
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
