
var SheenModel = require('./sheen-model.js');
var loader = require('./model-loader');

module.exports = Avatar;

var Super = SheenModel.prototype;
Avatar.prototype = Object.create(Super);

function Avatar(options) {
  this.twitching = false;
  this.sleeping = false;

  THREE.ImageUtils.crossOrigin = '';
  this.faceMaterial = new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('')
  });

  SheenModel.call(this, options);
}

Avatar.prototype.loadMesh = function(callback) {
  var self = this;

  this.faceGeometry = new THREE.BoxGeometry(1.25, 1.25, 1.25);
  this.faceMesh = new THREE.Mesh(this.faceGeometry, this.faceMaterial);

  this.createTextMesh();

  loader('/javascripts/3d_models/body.js', function (geometry, materials) {
    self.geometry = geometry;
    self.materials = materials;

    self.mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));

    self.mesh.scale.set(self.scale, self.scale, self.scale);

    self.faceMesh.position.y = 2.7;
    self.mesh.add(self.faceMesh);

    if (self.textMesh) {
      self.mesh.add(self.textMesh);
    }

    self.meshes = [self.mesh];

    if (callback) callback();
  });
};

Avatar.prototype.createTextMesh = function() {
  if (this.name === 'nameless_fuck') {
    return;
  }

  this.textMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000
  });

  this.textGeometry = new THREE.TextGeometry(this.name, {
    size: 0.7,
    height: 0.1,
    curveSegments: 5,
    font: 'droid sans',
    bevelEnabled: false
  });

  this.textGeometry.computeBoundingBox();
  this.textGeometry.computeBoundingSphere();
  this.textGeometry.computeVertexNormals();
  this.textGeometry.center();

  this.textMesh = new THREE.Mesh(this.textGeometry, this.textMaterial);
  this.textMesh.position.set(0, 4.3, 0);
};

Avatar.prototype.refreshTextMesh = function() {
  if (this.textMesh && this.hasLoadedMesh) {
    this.mesh.remove(this.textMesh);
  }

  this.createTextMesh();

  if (this.textMesh && this.hasLoadedMesh) {
    this.mesh.add(this.textMesh);
  }
};

Avatar.prototype.meshDidLoad = function() {
  Super.meshDidLoad.call(this);

  this.updateSkinColor(this.color);

  this.updateFaceImage(this.faceImageUrl);

  if (this.sleeping) {
    this.updateMeshForSleeping();
  }
};

Avatar.prototype.setScale = function(s) {
  this.mesh.scale.set(s, s, s);
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

Avatar.prototype.updateName = function(name) {
  if (this.name !== name) {
    this.name = name;
    this.refreshTextMesh();
  }
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

  if (this.textMaterial) {
    this.textMaterial.color = new THREE.Color(hex);
  }
};

Avatar.prototype.updateFaceImage = function(image) {
  var texture;

  if (typeof image === 'string' && image.length > 0) {
    this.faceImageUrl = image;
    texture = THREE.ImageUtils.loadTexture(image);
  } else if (image) {
    // gotta assume its a texturable image object thing (ie canvas)
    this.faceImageCanvas = image;
    texture = new THREE.Texture(image);
  }

  if (texture) {
    texture.needsUpdate = true;
    this.faceMaterial.map = texture;
    this.faceMaterial.needsUpdate = true;
  }
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
    this.moveTo(this.mesh.position.x, -10, this.mesh.position.z);
    this.rotate(Math.PI / 2, 0, 0);
  } else {
    this.moveTo(this.mesh.position.x, 0, this.mesh.position.z);
    this.rotate(-Math.PI / 2, 0, 0);
  }
};

Avatar.prototype.serialize = function() {
  var data = Super.serialize.call(this);

  data.name = this.name;
  data.color = this.color;
  data.faceImageUrl = this.faceImageUrl;
  data.currentDoor = this.currentDoor ? this.currentDoor._id : null;
  data.sleeping = this.sleeping;

  return data;
};

Avatar.prototype.updateFromModel = function(avatarData) {
  Super.updateFromModel.call(this, avatarData);

  if (!avatarData) avatarData = {};

  this.updateName(avatarData.name || 'nameless_fuck');
  this.updateSkinColor(avatarData.color || '#000000');
  this.updateFaceImage(avatarData.faceImageUrl);
  this.updateSleepState(avatarData.sleeping || false);

  if (avatarData.position) {
    this.moveTo(avatarData.position);
  }
};

Avatar.prototype.uploadableFaceImageData = function() {
  if (!this.faceImageCanvas || !this.faceImageCanvas.toDataURL) return null;

  return this.faceImageCanvas.toDataURL('image/jpeg', 0.7);
};

Avatar.prototype.positionAsCoordinates = function() {
  var pos = this.hasLoadedMesh ? this.mesh.position : {x: 0, y: 0, z: 0};
  return pos.x.toFixed(0) + 'x, ' + pos.z.toFixed(0) + 'y';
};
