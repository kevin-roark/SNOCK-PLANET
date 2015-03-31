
var globals = require('./global-state');
var SceneComponent = require('./scene-component');
var keymaster = require('./keymaster');
var mousemaster = require('./mousemaster');
var Avatar = require('./avatar');
var ObjectControls = require('./object-controls');

module.exports = AvatarControlComponent;

/** Constants */

var THIRD_PERSON_CAM_NAME = 'avatar-third';
var FIRST_PERSON_CAM_NAME = 'avatar-first';

/** Inherited methods */

function AvatarControlComponent() {}

AvatarControlComponent.prototype.__proto__ = SceneComponent.prototype;

AvatarControlComponent.prototype.postInit = function(options) {
  this.avatarsByName = {};

  this.avatar = globals.playerAvatar;
  this.renderObjects.push(this.avatar);

  this.firstPerson = false;

  this.controls = new ObjectControls({
    target: this.avatar
  });

  this.camera.addTarget({
    name: THIRD_PERSON_CAM_NAME,
    targetObject: this.avatar.trackingMesh(),
    cameraPosition: new THREE.Vector3(0, 4, 40),
    cameraRotation: new THREE.Euler(0, Math.PI, 0),
    stiffness: 0.2,
    fixed: false
  });

  this.camera.addTarget({
    name: FIRST_PERSON_CAM_NAME,
    targetObject: this.avatar.trackingMesh(),
    cameraPosition: new THREE.Vector3(0, 0, -1),
    cameraRotation: new THREE.Euler(0, Math.PI, 0),
    stiffness: 0.5,
    fixed: false
  });

  this.camera.setTarget(THIRD_PERSON_CAM_NAME);

  keymaster.setPreventDefaults(true);
  this.cam.requestPointerlock();
  this.addInteractionGlue();

  if (this.socket) {
    this.socket.on('avatar-entry', this.avatarEntered.bind(this));
    this.socket.on('avatar-moved', this.avatarMoved.bind(this));
    this.socket.on('avatar-sleep', this.avatarSlept.bind(this));
  }
};

AvatarControlComponent.prototype.preRender = function() {
  this.controls.update(this.nowDelta);
};

/** User Interaction */

AvatarControlComponent.prototype.addInteractionGlue = function() {
  keymaster.keypress(113, this.toggleCameraPerspective.bind(this));

  keymaster.keydown([38, 87], this.forwardKeydown.bind(this));
  keymaster.keydown([37, 65], this.leftwardKeydown.bind(this));
  keymaster.keydown([40, 83], this.downwardKeydown.bind(this));
  keymaster.keydown([39, 68], this.rightwardKeydown.bind(this));

  keymaster.keyup([38, 87], this.forwardKeyup.bind(this));
  keymaster.keyup([37, 65], this.leftwardKeyup.bind(this));
  keymaster.keyup([40, 83], this.downwardKeyup.bind(this));
  keymaster.keyup([39, 68], this.rightwardKeyup.bind(this));

  mousemaster.move(this.mousemove.bind(this), 'controls');
};

AvatarControlComponent.prototype.toggleCameraPerspective = function() {
  if (!this.controlsActive()) return;

  this.firstPerson = !this.firstPerson;

  this.avatar.setVisible(!this.firstPerson);

  var camName = this.firstPerson? FIRST_PERSON_CAM_NAME : THIRD_PERSON_CAM_NAME;
  this.camera.setTarget(camName);
};

AvatarControlComponent.prototype.forwardKeydown = function() {
  if (!this.controlsActive()) return;
  this.controls.setForward(true);
};
AvatarControlComponent.prototype.leftwardKeydown = function() {
  if (!this.controlsActive()) return;
  this.controls.setLeft(true);
};
AvatarControlComponent.prototype.downwardKeydown = function() {
  if (!this.controlsActive()) return;
  this.controls.setBackward(true);
};
AvatarControlComponent.prototype.rightwardKeydown = function() {
  if (!this.controlsActive()) return;
  this.controls.setRight(true);
};

AvatarControlComponent.prototype.forwardKeyup = function() {
  this.controls.setForward(false);
};
AvatarControlComponent.prototype.leftwardKeyup = function() {
  this.controls.setLeft(false);
};
AvatarControlComponent.prototype.downwardKeyup = function() {
  this.controls.setBackward(false);
};
AvatarControlComponent.prototype.rightwardKeyup = function() {
  this.controls.setRight(false);
};

AvatarControlComponent.prototype.mousemove = function(x, y, ev) {
  if (!this.controlsActive()) return;

  var event = ev.originalEvent || ev;
  var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
  this.controls.mouseUpdate(movementX, movementY);
};

/** IO Response */

AvatarControlComponent.prototype.avatarEntered = function(avatarData) {
  var avatar = this.avatarWithName(avatarData.name);
  if (!avatar) {
    avatar = new Avatar(avatarData);
    this.addObject3d(avatar);
    this.avatarsByName[avatar.name] = avatar;
  }

  avatar.wakeUp();
};

AvatarControlComponent.prototype.avatarMoved = function(avatarData) {
  var avatar = this.avatarWithName(avatarData.name);
  if (avatar) {
    var pos = avatarData.position;
    avatar.moveTo(pos.x, pos.y, pos.z);
  }
};

AvatarControlComponent.prototype.avatarSlept = function(name) {
  var avatar = this.avatarWithName(name);
  if (avatar) {
    avatar.goSleep();
  }
};

/** Utility */

AvatarControlComponent.prototype.avatarWithName = function(name) {
  return this.avatarsByName[name];
};

AvatarControlComponent.prototype.controlsActive = function() {
  return !this.creatingDoor;
};
