
var $ = require('jquery');
var globals = require('./global-state');
var SceneComponent = require('./scene-component');
var keymaster = require('./keymaster');

module.exports = GeneralPlanetComponent;

/** Inherited methods */

function GeneralPlanetComponent() {};

GeneralPlanetComponent.prototype.__proto__ = SceneComponent.prototype;

GeneralPlanetComponent.prototype.postInit = function(options) {
  var self = this;

  this.avatar = globals.playerAvatar;
  this.avatar.rotateTo(0, Math.PI, 0);
  this.renderObjects.push(this.avatar);

  this.firstPerson = false;

  this.cam.requestPointerLock();

  keymaster.setKeypressListener(113, true, function(ev) {
    self.toggleCameraPerspective();
  });
};

GeneralPlanetComponent.prototype.preRender = function() {
  var camPosition = this.cam.controlPosition();
  if (this.firstPerson) {
    this.avatar.moveTo(camPosition.x, camPosition.y, camPosition.z);
  } else {
    this.avatar.moveTo(camPosition.x, camPosition.y, camPosition.z - 20);
  }
};

/** "Custom" methods */

GeneralPlanetComponent.prototype.toggleCameraPerspective = function() {
  this.firstPerson = !this.firstPerson;
  this.avatar.setVisible(!this.firstPerson);
};
