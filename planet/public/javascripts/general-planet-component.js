
var $ = require('jquery');
var globals = require('./global-state');
var SceneComponent = require('./scene-component');
var keymaster = require('./keymaster');
var mousemaster = require('./mousemaster');
var Avatar = require('./avatar');
var Door = require('./door');
var ObjectControls = require('./lib/ObjectControls');

module.exports = GeneralPlanetComponent;

/** Constants */

var THIRD_PERSON_CAM_NAME = 'avatar-third';
var FIRST_PERSON_CAM_NAME = 'avatar-first';

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

  this.controls = new ObjectControls({
    targetObject: this.avatar.trackingMesh()
  });

  this.camera.addTarget({
    name: THIRD_PERSON_CAM_NAME,
    targetObject: this.avatar.trackingMesh(),
    cameraPosition: new THREE.Vector3(0, 10, 20),
    stiffness: 0.2,
    fixed: false
  });

  this.camera.addTarget({
    name: FIRST_PERSON_CAM_NAME,
    targetObject: this.avatar.trackingMesh(),
    cameraPosition: new THREE.Vector3(0, 0, -1),
    stiffness: 0.5,
    fixed: false
  });

  this.camera.setTarget(THIRD_PERSON_CAM_NAME);

  keymaster.keypress(113, true, function(){ self.toggleCameraPerspective(); });

  keymaster.keydown([38, 87], true, function(){ self.forwardKeydown(); });
  keymaster.keydown([37, 65], true, function(){ self.leftwardKeydown(); });
  keymaster.keydown([40, 83], true, function(){ self.downwardKeydown(); });
  keymaster.keydown([39, 68], true, function(){ self.rightwardKeydown(); });

  keymaster.keyup([38, 87], true, function(){ self.forwardKeyup(); });
  keymaster.keyup([37, 65], true, function(){ self.leftwardKeyup(); });
  keymaster.keyup([40, 83], true, function(){ self.downwardKeyup(); });
  keymaster.keyup([39, 68], true, function(){ self.rightwardKeyup(); });

  mousemaster.move(function(){ self.mouseMove(); }, 'controls');

  if (this.socket) {
    this.socket.on('avatar-entry', this.avatarEntered);
    this.socket.on('avatar-moved', this.avatarMoved);
    this.socket.on('avatar-sleep', this.avatarSlept);
    this.socket.on('door-creation', this.doorCreated);
  }
};

GeneralPlanetComponent.prototype.preRender = function() {
  this.controls.update(this.nowDelta);
};

/** User Interaction */

GeneralPlanetComponent.prototype.toggleCameraPerspective = function() {
  this.firstPerson = !this.firstPerson;

  this.avatar.setVisible(!this.firstPerson);

  var camName = this.firstPerson? FIRST_PERSON_CAM_NAME : THIRD_PERSON_CAM_NAME;
  this.camera.setTarget(camName);
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
  x -= (window.innerWidth / 2);
  y -= (window.innerHeight / 2);
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
