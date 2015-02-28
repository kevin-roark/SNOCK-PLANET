
var $ = require('jquery');
var globals = require('./global-state');
var SceneComponent = require('./scene-component');
var keymaster = require('./keymaster');
var Avatar = require('./avatar');
var Door = require('./door');

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

  keymaster.setKeypressListener(113, true, function(ev) {
    self.toggleCameraPerspective();
  });

  if (this.socket) {
    this.socket.on('avatar-entry', this.avatarEntered);
    this.socket.on('avatar-moved', this.avatarMoved);
    this.socket.on('avatar-sleep', this.avatarSlept);
    this.socket.on('door-creation', this.doorCreated);
  }
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
