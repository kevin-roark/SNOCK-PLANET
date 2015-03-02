
var $ = require('jquery');
var globals = require('./global-state');
var SceneComponent = require('./scene-component');
var keymaster = require('./keymaster');
var mousemaster = require('./mousemaster');
var Avatar = require('./avatar');
var Door = require('./door');
var ObjectControls = require('./ObjectControls');

module.exports = GeneralPlanetComponent;

/** Inherited methods */

function GeneralPlanetComponent() {};

GeneralPlanetComponent.prototype.__proto__ = SceneComponent.prototype;

GeneralPlanetComponent.prototype.postInit = function(options) {
  var self = this;

  this.avatarsByName = {};

  this.avatar = globals.playerAvatar;
  this.avatar.rotateTo(0, Math.PI, 0);
  this.renderObjects.push(this.avatar);

  this.firstPerson = false;

  this.cam.requestPointerLock();

  if (this.socket) {
    this.socket.on('avatar-entry', this.avatarEntered);
    this.socket.on('avatar-moved', this.avatarMoved);
    this.socket.on('avatar-sleep', this.avatarSlept);
    this.socket.on('door-creation', this.doorCreated);
  }

  keymaster.keypress(113, true, self.toggleCameraPerspective);

  keymaster.keydown([38, 87], true, self.forwardKeydown);
  keymaster.keydown([37, 65], true, self.leftwardKeydown);
  keymaster.keydown([40, 83], true, self.downwardKeydown);
  keymaster.keydown([39, 68], true, self.rightwardKeydown);

  keymaster.keyup([38, 87], true, self.forwardKeyup);
  keymaster.keyup([37, 65], true, self.leftwardKeyup);
  keymaster.keyup([40, 83], true, self.downwardKeyup);
  keymaster.keyup([39, 68], true, self.rightwardKeyup);

  mousemaster.move(self.mouseMove, 'controls');

  this.controls = new ObjectControls({
    targetObject: this.avatar
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

/** User Interaction */

GeneralPlanetComponent.prototype.toggleCameraPerspective = function() {
  this.firstPerson = !this.firstPerson;
  this.avatar.setVisible(!this.firstPerson);
};

GeneralPlanetComponent.prototype.forwardKeydown = function() {
  this.controls.setForward(true);
};
GeneralPlanetComponent.prototype.leftwardKeydown = function() {
  this.controls.setLeft(true);
};
GeneralPlanetComponent.prototype.downwardKeydown = function() {
  this.controls.setBackward(true);
};
GeneralPlanetComponent.prototype.rightwardKeydown = function() {
  this.controls.setRight(true);
};

GeneralPlanetComponent.prototype.forwardKeyup = function() {
  this.controls.setForward(false);
};
GeneralPlanetComponent.prototype.leftwardKeyup = function() {
  this.controls.setLeft(false);
};
GeneralPlanetComponent.prototype.downwardKeyup = function() {
  this.controls.setBackward(false);
};
GeneralPlanetComponent.prototype.rightwardKeyup = function() {
  this.controls.setRight(false);
};

GeneralPlanetComponent.prototype.mouseMove = function(x, y) {
  x -= (window.innerWidth/2);
  y -= (window.innerHeight/2);
  var threshold = 15;

  if ((x > 0 && x < threshold) || (x < 0 && x > -threshold)) {
      x = 0;
  }
  if ((y > 0 && y < threshold) || (y < 0 && y > -threshold)) {
      y = 0;
  }

  this.controls.mousePos.set(x, y);
};

/** IO Response */

GeneralPlanetComponent.prototype.avatarEntered = function(avatarData) {
  var avatar = this.avatarWithName(avatarData.name);
  if (!avatar) {
    avatar = new Avatar(avatarData);
    this.addObject3d(avatar);
    this.avatarsByName[avatar.name] = avatar;
  }

  avatar.wakeUp();
};

GeneralPlanetComponent.prototype.avatarMoved = function(avatarData) {
  var avatar = this.avatarWithName(avatarData.name);
  if (avatar) {
    var pos = avatarData.position;
    avatar.moveTo(pos.x, pos.y, pos.z);
  }
};

GeneralPlanetComponent.prototype.avatarSlept = function(name) {
  var avatar = this.avatarWithName(name);
  if (avatar) {
    avatar.goSleep();
  }
};

GeneralPlanetComponent.prototype.doorCreated = function(doorData) {
  var door = new Door(doorData);
  this.addObject3d(door);
};

/** Utility */

GeneralPlanetComponent.prototype.avatarWithName = function(name) {
  return this.avatarsByName[name];
};
