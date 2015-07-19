
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

  this.frameCount = 0;

  this.postInit(options);
};

SceneComponent.prototype.postInit = function(options) {};

SceneComponent.prototype.render = function() {
  this.frameCount += 1;

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
  this.finished = false;

  for (var i = 0; i < this.renderObjects.length; i++) {
    this.renderObjects[i].addTo(this.scene);
  }

  for (i = 0; i < this.additionalMeshes.length; i++) {
    this.scene.add(this.additionalMeshes[i]);
  }
};

SceneComponent.prototype.removeObjects = function() {
  for (var i = 0; i < this.renderObjects.length; i++) {
    this.renderObjects[i].removeFrom(this.scene);
  }

  for (var i = 0; i < this.additionalMeshes.length; i++) {
    this.scene.remove(this.additionalMeshes[i]);
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

SceneComponent.prototype.addSheenModel = function(sheenModel, callback) {
  if (this.finished) {
    this.renderObjects.push(sheenModel);
    if (callback) callback();
    return;
  }

  var self = this;
  sheenModel.addTo(this.scene, function() {
    self.renderObjects.push(sheenModel);
    if (callback) callback();
  });
};

SceneComponent.prototype.removeSheenModel = function(sheenModel, callback) {
  var self = this;
  sheenModel.removeFrom(this.scene, function() {
    var decrepitIndex = self.renderObjects.indexOf(sheenModel);
    console.log('decrip: ' + decrepitIndex);
    if (decrepitIndex >= 0) {
      self.renderObjects.splice(decrepitIndex, 1); // remove the irrelevant object
    }

    if (callback) callback();
  });
};

SceneComponent.prototype.addMesh = function(mesh) {
  this.scene.add(mesh);
  this.additionalMeshes.push(mesh);
};

SceneComponent.prototype.showLoading = function(show) {
  var $loading = $('.loading-wrapper');
  if (show) {
    $loading.show();
  } else {
    $loading.hide();
  }
};

SceneComponent.prototype.showError = function(message, timeout) {
  if (!timeout) timeout = 2000;

  var $error = $('.error');
  $error.text(message);
  $error.show();
  setTimeout(function() {
    $error.hide();
  }, timeout);
}

SceneComponent.prototype.preRender = function() {};
SceneComponent.prototype.postRender = function() {};

SceneComponent.prototype.clean = function() {};

SceneComponent.prototype.layout = function() {};
