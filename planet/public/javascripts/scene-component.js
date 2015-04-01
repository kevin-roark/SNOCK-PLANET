
var $ = require('jquery');

module.exports = SceneComponent;

function SceneComponent() {}

SceneComponent.prototype.init = function(scene, socket, cam, options) {
  this.scene = scene;
  this.socket = socket;
  this.cam = cam;
  this.camera = cam.cam;
  this.prevTime = performance.now();

  this.renderObjects = [];
  this.additionalMeshes = [];

  this.layout();
  $(window).resize(this.layout);

  this.postInit(options);
};

SceneComponent.prototype.postInit = function(options) {};

SceneComponent.prototype.render = function() {
  this.now = performance.now();
  this.nowDelta = (this.now - this.prevTime) / 1000;

  this.preRender();

  for (var i = 0; i < this.renderObjects.length; i++) {
    this.renderObjects[i].render();
  }

  this.postRender();

  this.prevTime = performance.now();
};

SceneComponent.prototype.restore = function() {
  for (var i = 0; i < this.renderObjects.length; i++) {
    this.renderObjects[i].addTo(this.scene);
  }

  for (var i = 0; i < this.additionalMeshes.length; i++) {
    scene.add(this.additionalMeshes[i]);
  }
};

SceneComponent.prototype.removeObjects = function() {
  for (var i = 0; i < this.renderObjects.length; i++) {
    this.renderObjects[i].removeFrom(this.scene);
  }

  for (var i = 0; i < this.additionalMeshes.length; i++) {
    scene.remove(this.additionalMeshes[i]);
  }
};

SceneComponent.prototype.markFinished = function() {
  this.finished = true;
  this.clean();
  this.removeObjects();

  if (this.finishedCallback) {
    this.finishedCallback();
  }
};

SceneComponent.prototype.addObject3d = function(object3d, callback) {
  console.log('adding! ' + object3d);
  var self = this;
  object3d.addTo(this.scene, function() {
    self.renderObjects.push(object3d);
    if (callback) callback();
  });
};

SceneComponent.prototype.addMesh = function(mesh) {
  this.scene.add(mesh);
  this.additionalMeshes.push(mesh);
};


SceneComponent.prototype.preRender = function() {};
SceneComponent.prototype.postRender = function() {};

SceneComponent.prototype.clean = function() {};

SceneComponent.prototype.layout = function() {};
