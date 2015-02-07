
// requirements
var kt = require('./lib/kutility');
var config = require('./config');

module.exports = Door;

function Door(options) {
  if (!options.position) options.position = {};
  this.initX = options.position.x || 0;
  this.initY = options.position.y || 0;
  this.initZ = options.position.z || 0;

  this.scale = options.scale || 2;

  this.material = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture(config.door_texture),
      reflectivity: 0.15
  });
  this.geometry = new THREE.BoxGeometry(2, 10, 0.5);
  this.mesh = new THREE.BasicMesh(this.geometry, this.material);
};

Door.prototype.addTo = function(scene, renderer) {
  scene.add(this.mesh);
};

Door.prototype.move = function(x, y, z) {
  if (!this.mesh) return;

  this.mesh.position.x += x;
  this.mesh.position.y += y;
  this.mesh.position.z += z;
};

Door.prototype.rotate = function(rx, ry, rz) {
  if (!this.mesh) return;

  this.mesh.rotation.x += rx;
  this.mesh.rotation.y += ry;
  this.mesh.rotation.z += rz;
};

Door.prototype.moveTo = function(x, y, z) {
  if (!this.mesh) return;

  this.mesh.position.x = x;
  this.mesh.position.y = y;
  this.mesh.position.z = z;

  this.move(0, 0, 0);
};

Door.prototype.render = function() {

};
