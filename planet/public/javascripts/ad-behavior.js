
var Avatar = require('./avatar.js');

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
    self.faceMesh.position.y = 4.0;

    self.textMesh.position.set(0, 7.0, 0);
  });
}

Advatar.prototype.createFaceGeometry = function() {
  return new THREE.BoxGeometry(2.5, 2.5, 2.5);
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
