
// requirements
var config = require('./config');

module.exports = Door;

function Door(options) {
  if (!options) options = {};
  if (!options.position) options.position = {};

  this.initX = options.position.x || 0;
  this.initY = options.position.y || 0;
  this.initZ = options.position.z || 0;

  this.scale = options.scale || 2;

  this.subject = options.subject || '';
  this.texture = options.texture || config.door_texture;

  this.material = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture(this.texture),
      reflectivity: 0.15
  });
  this.geometry = new THREE.BoxGeometry(8, 20, 0.5);
  this.geometry.center();
  this.mesh = new THREE.Mesh(this.geometry, this.material);

  this.createTextMesh();

  this.moveTo(this.initX, this.initY, this.initZ);
}

Door.prototype.createTextMesh = function() {
  this.textMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000
  });

  this.textGeometry = new THREE.TextGeometry(this.subject, {
    size: 2.2,
    height: 0.01,
    curveSegments: 1,
    font: 'droid sans',
    bevelThickness: 0.35,
    bevelSize: 0.15,
    bevelSegments: 1,
    bevelEnabled: true
  });
  this.textGeometry.computeBoundingBox();
  this.textGeometry.computeBoundingSphere();
  this.textGeometry.computeVertexNormals();
  this.textGeometry.center();

  this.textMesh = new THREE.Mesh(this.textGeometry, this.textMaterial);

  this.mesh.add(this.textMesh);
  this.textMesh.position.set(0, 13, 0);
};

Door.prototype.addTo = function(scene) {
  scene.add(this.mesh);
};

Door.prototype.move = function(x, y, z) {
  if (!this.mesh) return;

  this.mesh.translateX(x);
  this.mesh.translateY(y);
  this.mesh.translateZ(z);
};

Door.prototype.rotate = function(rx, ry, rz) {
  if (!this.mesh) return;

  this.mesh.rotation.x += rx;
  this.mesh.rotation.y += ry;
  this.mesh.rotation.z += rz;
};

Door.prototype.moveTo = function(x, y, z) {
  if (!this.mesh) return;

  this.mesh.position.set(x, y + 4, z);
  this.move(0, 0, 0);
};

Door.prototype.render = function() {
  this.textMesh.rotation.y += 0.015;
};

Door.prototype.meshes = function() {
  return [this.mesh, this.textMesh];
};

Door.prototype.setVisible = function(visible) {
  this.mesh.visible = visible;
};

Door.prototype.serialize = function() {
  return {
    subject: this.subject,
    texture: this.texture,
    position: {
      x: this.mesh.position.x,
      z: this.mesh.position.z
    },
    when: new Date()
  };
};
