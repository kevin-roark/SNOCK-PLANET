
module.exports = SheenModel;

function SheenModel(options) {
  if (!options) options = {};

  this.updateFromModel(options);

  this.initialPosition = options.position || {x: 0, y: 0, z: 0};
  if (!this.initialPosition.y) this.initialPosition.y = 0;

  this.scale = options.scale || 2;

  this.hasLoadedMesh = false;

  this.postLoadBehaviors = [];
}

SheenModel.prototype.loadMesh = function(callback) {
  this.mesh = new THREE.Mesh();
  this.meshes = [this.mesh];
  if (callback) callback();
};

SheenModel.prototype.meshDidLoad = function() {
  this.move(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);

  for (var i = 0; i < this.postLoadBehaviors.length; i++) {
    this.postLoadBehaviors[i]();
  }
};

SheenModel.prototype.addTo = function(scene, callback) {
  var self = this;

  function performAdd() {
    for (var i = 0; i < self.meshes.length; i++) {
      scene.add(self.meshes[i]);
    }
    if (callback) callback();
  }

  if (!this.hasLoadedMesh) {
    this.loadMesh(function() {
      self.hasLoadedMesh = true;
      self.meshDidLoad();
      performAdd();
    });
  } else {
    performAdd();
  }
};

SheenModel.prototype.removeFrom = function(scene) {
  if (!this.hasLoadedMesh) return;

  for (var i = 0; i < this.meshes.length; i++) {
    scene.remove(this.meshes[i]);
  }
};

SheenModel.prototype.move = function(x, y, z) {
  if (!this.hasLoadedMesh) return;

  this.mesh.translateX(x);
  this.mesh.translateY(y);
  this.mesh.translateZ(z);
};

SheenModel.prototype.rotate = function(rx, ry, rz) {
  if (!this.hasLoadedMesh) return;

  this.mesh.rotation.x += rx;
  this.mesh.rotation.y += ry;
  this.mesh.rotation.z += rz;

  for (var i = 0; i < this.meshes.length; i++) {
    var mesh = this.meshes[i];
    if (mesh !== this.mesh) {
      mesh.rotation.copy(this.mesh.rotation);
    }
  }
};

SheenModel.prototype.rotateTo = function(x, y, z) {
  if (!this.hasLoadedMesh) {
    var self = this;
    this.postLoadBehaviors.push(function() {
      self.rotateTo(x, y, z);
    });
    return;
  }

  this.mesh.rotation.set(x, y, z);
  this.rotate(0, 0, 0);
};

SheenModel.prototype.moveTo = function(x, y, z) {
  if (!this.hasLoadedMesh) return;

  this.mesh.position.set(x, y, z);
  this.move(0, 0, 0);
};

SheenModel.prototype.setVisible = function(visible) {
  if (!this.hasLoadedMesh) return;

  for (var i = 0; i < this.meshes.length; i++) {
    this.meshes[i].visible = visible;
  }
};

SheenModel.prototype.render = function() {};

SheenModel.prototype.toString = function() {
  return JSON.stringify(this.serialize());
};

SheenModel.prototype.serialize = function() {
  var data = {};
  if (this._id) {
    data._id = this._id;
  }
  return data;
};

SheenModel.prototype.updateFromModel = function(modelData) {
  if (!modelData) modelData = {};
  this._id = modelData._id || null;
};
