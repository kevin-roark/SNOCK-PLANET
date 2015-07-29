
var $ = require('jquery');

var globals = require('./global-state');
var config = require('./config');
var SceneComponent = require('./scene-component');
var keymaster = require('./keymaster');
var mousemaster = require('./mousemaster');
var Avatar = require('./avatar');
var ObjectControls = require('./object-controls');

module.exports = AvatarControlComponent;

/** Constants */

var THIRD_PERSON_CAM_NAME = 'avatar-third';
var FIRST_PERSON_CAM_NAME = 'avatar-first';

var $questionMark = $('.question-mark');

/** Inherited methods */

function AvatarControlComponent() {}

AvatarControlComponent.prototype = Object.create(SceneComponent.prototype);

AvatarControlComponent.prototype.postInit = function(options) {
  var self = this;

  this.avatarsByName = {};

  this.avatar = globals.playerAvatar;
  this.addSheenModel(this.avatar);

  this.firstPerson = false;
  this.inCreationMode = false;

  this.controls = new ObjectControls(this.controlsOptions());

  this.addCameraTargets();

  this.cam.requestPointerlock();
  setTimeout(function() {
    self.reactToPointerLock(self.cam.hasPointerlock);
  }, 2000);
  this.addInteractionGlue();
};

AvatarControlComponent.prototype.controlsOptions = function() {
  return {
    target: this.avatar,
    verticalMouseControl: false,
  };
};

AvatarControlComponent.prototype.preRender = function() {
  this.controls.update(this.nowDelta);
};

AvatarControlComponent.prototype.restore = function() {
  SceneComponent.prototype.restore.call(this);

  this.addCameraTargets();
  this.addInteractionGlue();
};

AvatarControlComponent.prototype.clean = function() {
  SceneComponent.prototype.clean.call(this);

  keymaster.clearKeydownListener();
  keymaster.clearKeyupListener();
  keymaster.clearKeypressListener();
  keymaster.setPreventDefaults(false);

  mousemaster.clearMove('controls');

  this.camera.removeTarget(THIRD_PERSON_CAM_NAME);
  this.camera.removeTarget(FIRST_PERSON_CAM_NAME);

  this.cam.pointerLockChangeCallback = null;
};

/** User Interaction */

AvatarControlComponent.prototype.addCameraTargets = function() {
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
};

AvatarControlComponent.prototype.addInteractionGlue = function() {
  var self = this;

  keymaster.setPreventDefaults(true);

  keymaster.keypress(113, this.toggleCameraPerspective.bind(this));

  keymaster.keypress(110, this.enterFormCreation.bind(this)); // n
  //keymaster.keydown(27, this.exitFormCreation.bind(this)); // esc

  keymaster.keydown([38, 87], this.forwardKeydown.bind(this));
  keymaster.keydown([37, 65], this.leftwardKeydown.bind(this));
  keymaster.keydown([40, 83], this.downwardKeydown.bind(this));
  keymaster.keydown([39, 68], this.rightwardKeydown.bind(this));

  keymaster.keyup([38, 87], this.forwardKeyup.bind(this));
  keymaster.keyup([37, 65], this.leftwardKeyup.bind(this));
  keymaster.keyup([40, 83], this.downwardKeyup.bind(this));
  keymaster.keyup([39, 68], this.rightwardKeyup.bind(this));

  mousemaster.move(this.mousemove.bind(this), 'controls');

  this.cam.pointerLockChangeCallback = function(hasPointerLock) {
    self.reactToPointerLock(hasPointerLock);
  };
};

AvatarControlComponent.prototype.toggleCameraPerspective = function() {
  if (!this.controlsActive()) return;

  this.firstPerson = !this.firstPerson;

  this.avatar.setVisible(!this.firstPerson);

  var camName = this.firstPerson? FIRST_PERSON_CAM_NAME : THIRD_PERSON_CAM_NAME;
  this.camera.setTarget(camName);
};

AvatarControlComponent.prototype.enterFormCreation = function() {
  if (this.inCreationMode) return false;

  $questionMark.fadeOut();

  this.inCreationMode = true;
  keymaster.setPreventDefaults(false);

  if (this.cam.canEverHavePointerLock()) {
    var self = this;
    setTimeout(function() {
      self.cam.exitPointerlock();
      self.reactToPointerLock(self.cam.hasPointerlock);
    }, 100);
  }

  return true;
};

AvatarControlComponent.prototype.exitFormCreation = function() {
  if (!this.inCreationMode) return false;

  $questionMark.fadeIn();

  this.inCreationMode = false;
  keymaster.setPreventDefaults(true);
  if (this.cam.canEverHavePointerLock()) {
    var self = this;
    setTimeout(function() {
      self.cam.requestPointerlock();
      self.reactToPointerLock(self.cam.hasPointerlock);
    }, 100);
  }

  return true;
};

AvatarControlComponent.prototype.reactToPointerLock = function(hasPointerlock) {
  if (!this.cam.canEverHavePointerLock()) {
    return;
  }

  var $pointerLockTip = $('.pointer-lock-tip');

  if (this.inCreationMode && !hasPointerlock) {
    $pointerLockTip.hide();
  }
  else if (!this.inCreationMode && hasPointerlock) {
    $pointerLockTip.hide();
  }
  else if (this.inCreationMode && hasPointerlock) {
    $pointerLockTip.text('PRESS ESCAPE TO UNLOCK YOUR HANDS (MOUSE)');
    $pointerLockTip.show();
  }
  else if (!this.inCreationMode && !hasPointerlock) {
    $pointerLockTip.text('CLICK ANYWHERE TO UNLOCK YOUR EYES (MOUSE)');
    $pointerLockTip.show();
  }
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
  var movementX = event.movementX || event.mozMovementX || event.webkitMovementX;
  var movementY = event.movementY || event.mozMovementY || event.webkitMovementY;

  // fallback for browsers with no movement
  if (movementX === undefined) {
    if (this.lastClientX !== undefined) {
      movementX = event.clientX - this.lastClientX;
      movementY = event.clientY - this.lastClientY;
    }
    else {
      movementX = 0;
      movementY = 0;
    }

    this.lastClientX = event.clientX;
    this.lastClientY = event.clientY;
  }

  this.controls.mouseUpdate(movementX, movementY);
};

/* Avatar Management */

AvatarControlComponent.prototype.avatarUpdate = function(avatarData) {
  if (avatarData._id === this.avatar._id) {
    return;
  }

  var avatar = this.avatarsByName[avatarData.name];
  if (!avatar) {
    avatar = new Avatar(avatarData);
    this.addSheenModel(avatar);
    this.avatarsByName[avatarData.name] = avatar;
  }
  else {
    avatar.updateFromModel(avatarData);
  }
};

// called with avatars we already have inside or that just joined
AvatarControlComponent.prototype.handleMyAvatars = function(updatedAvatars) {
  for (var i = 0; i < updatedAvatars.length; i++) {
    var avatarData = updatedAvatars[i];
    this.avatarUpdate(avatarData);
  }
};

AvatarControlComponent.prototype.containsAvatar = function(avatarData) {
  return this.avatarsByName[avatarData.name];
};

AvatarControlComponent.prototype.removeAvatar = function(avatarData) {
  var myAvatar = this.avatarsByName[avatarData.name];
  if (myAvatar) {
    // if we used to control it before this update, delete it
    this.removeSheenModel(myAvatar);
    delete this.avatarsByName[avatarData.name];
  }
};

/** Utility */

AvatarControlComponent.prototype.controlsActive = function() {
  return !this.inCreationMode;
};
