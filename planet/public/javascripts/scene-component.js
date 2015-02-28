
var $ = require('jquery');

module.exports = SceneComponent;

function SceneComponent() {};

SceneComponent.prototype.init = function(scene, socket, cam, options) {
  this.scene = scene;
  this.socket = socket;
  this.cam = cam;
  this.camera = cam.cam;

  this.renderObjects = [];

  this.layout();
  $(window).resize(this.layout);

  this.postInit(options);
};

SceneComponent.prototype.postInit = function(options) {};

SceneComponent.prototype.render = function() {
  this.preRender();

  for (var i = 0; i < this.renderObjects.length; i++) {
    this.renderObjects[i].render();
  }

  this.postRender();
};

SceneComponent.prototype.markFinished = function() {
  this.finished = true;
  this.clean();
  if (this.finishedCallback) {
    this.finishedCallback();
  }
};

SceneComponent.prototype.addObject3d = function(object3d) {
  object3d.addTo(this.scene);
  this.renderObjects.push(object3d);
};


SceneComponent.prototype.preRender = function() {};
SceneComponent.prototype.postRender = function() {};

SceneComponent.prototype.clean = function() {};

SceneComponent.prototype.layout = function() {};
