
var $ = require('jquery');

module.exports = SceneComponent;

function SceneComponent() {};

SceneComponent.prototype.init = function(scene, socket) {
  this.scene = scene;
  this.socket = socket;

  this.renderObjects = [];

  this.layout();
  $(window).resize(this.layout);

  this.postInit();
};

SceneComponent.prototype.postInit = function() {};

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

SceneComponent.prototype.preRender = function() {};
SceneComponent.prototype.postRender = function() {};

SceneComponent.prototype.clean = function() {};

SceneComponent.prototype.layout = function() {};
