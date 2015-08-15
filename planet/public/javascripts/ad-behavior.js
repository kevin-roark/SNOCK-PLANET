
var Avatar = require('./avatar.js');
var makeTextCanvas = require('./text-canvas');

module.exports.Advatar = Advatar;

var Super = Avatar.prototype;
Advatar.prototype = Object.create(Super);

function Advatar(adData) {
  adData.sleeping = false;
  adData.position = new THREE.Vector3(
    -50 + Math.random() * 100,
    0,
    -50 + Math.random() * 100
  );

  this.positionTarget = nextPositionTarget();
  this.velocity = 0.2;

  Avatar.call(this, adData);

  var self = this;
  this.postLoadBehaviors.push(function() {
    self.faceMesh.position.y = 6.0;

    self.textMesh.position.set(0, 11.0, 0);

    self.createAdMesh();
  });
}

Advatar.prototype.updateFromModel = function(adData) {
  Super.updateFromModel.call(this, adData);

  this.text = adData.text || '';
  this.adBackground = adData.background;
};

Advatar.prototype.createAdMesh = function() {
  this.adCanvas = makeTextCanvas({
    text: this.text,
    backgroundColor: this.adBackground
  });

  var texture = new THREE.Texture(this.adCanvas);
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;

  // material === material wit tha words on it
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  });

  var accentMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  });

  var materials = [
    accentMaterial, accentMaterial.clone(), accentMaterial.clone(), accentMaterial.clone(),
    material, material.clone()
  ];

  var meshFaceMaterial = new THREE.MeshFaceMaterial(materials);

  var scalar = 0.025;
  var width = this.adCanvas.width * this.scale * scalar;
  var height = this.adCanvas.height * this.scale * scalar;
  var geometry = new THREE.BoxGeometry(width, height, 0.5);

  var mesh = new THREE.Mesh(geometry, meshFaceMaterial);
  mesh.doubleSided = true;

  this.adMesh = mesh;
  this.adMesh.position.set(6 + width / 2, 10, 0);
  this.mesh.add(this.adMesh);
};

Advatar.prototype.createFaceGeometry = function() {
  return new THREE.BoxGeometry(8, 8, 8);
};

Advatar.prototype.render = function() {
  Super.render.call(this);

  if (!this.hasLoadedMesh) {
    return;
  }

  var pos = this.mesh.position;
  var target = this.positionTarget;
  var vel = this.velocity;
  var threshold = vel * 1.75;

  var xd = pos.x > target.x ? -vel : vel;
  var yd = 0;
  var zd = pos.z > target.z ? -vel : vel;

  this.move(xd, yd, zd);

  if (Math.abs(pos.x - target.x) <= threshold && Math.abs(pos.z - target.z) <= threshold) {
    this.positionTarget = nextPositionTarget();
  }
};

function nextPositionTarget() {
  var x = -300 + Math.random() * 600;
  var y = 0;
  var z = -300 + Math.random() * 600;
  return new THREE.Vector3(x, y, z);
}
