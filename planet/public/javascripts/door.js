
var SheenModel = require('./sheen-model');
var config = require('./config');

module.exports = Door;

var Super = SheenModel.prototype;
Door.prototype = Object.create(Super);

function Door(options) {
  SheenModel.call(this, options);
}

Door.prototype.updateFromModel = function(doorData) {
  Super.updateFromModel.call(this, doorData);

  this.subject = doorData.subject || '';
  this.when = doorData.when || new Date();
  this.texture = doorData.texture || config.randomTexture(config.door_textures);
  this.wallTexture = doorData.wallTexture || config.randomTexture(config.room_textures);
  this.creator = doorData.creator;
};

Door.prototype.loadMesh = function(callback) {
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

Door.prototype.render = function() {
  if (!this.hasLoadedMesh) return;

  this.textMesh.rotation.y += 0.024;
};

Door.prototype.setTexture = function(texture) {
  this.texture = texture;

  if (!this.hasLoadedMesh) return;

  this.material.map = THREE.ImageUtils.loadTexture(this.texture);
  this.material.needsUpdate = true;
};

Door.prototype.setSubject = function(subject) {
  if (this.subject !== subject) {
    this.subject = subject;

    if (this.hasLoadedMesh && this.textMesh) {
      this.mesh.remove(this.textMesh);
    }

    if (this.hasLoadedMesh) {
      this.createTextMesh();
    }

  }
};

Door.prototype.serialize = function() {
  var data = Super.serialize.call(this);

  data.subject = this.subject;
  data.texture = this.texture;
  data.wallTexture = this.wallTexture || config.randomTexture(config.room_textures);
  data.when = this.when;
  data.creator = this.creator;

  return data;
};
