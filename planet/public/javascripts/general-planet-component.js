
var $ = require('jquery');
var globals = require('./global-state');
var SceneComponent = require('./scene-component');
var keymaster = require('./keymaster');
var mousemaster = require('./mousemaster');
var Avatar = require('./avatar');
var Door = require('./door');
var ObjectControls = require('./object-controls');
var apiTools = require('./api-tools');

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
  this.renderObjects.push(this.avatar);

  this.firstPerson = false;

  this.creatingDoor = false;
  this.creationDoor = new Door();
  this.creationDoor.setVisible(false);
  this.addObject3d(this.creationDoor);

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
    this.socket.on('door-creation', this.addDoor.bind(this));

    this.socket.emit('get-doors', {position: {x: 0, y: 0, z: 0}}, function(doors) {
      for (var i = 0; i < doors.length; i++) {
        self.addDoor(doors[i]);
      }
    });
  }
};

GeneralPlanetComponent.prototype.preRender = function() {
  this.controls.update(this.nowDelta);
};

/** User Interaction */

GeneralPlanetComponent.prototype.addInteractionGlue = function() {
  var self = this;

  keymaster.keypress(113, function(){ self.toggleCameraPerspective(); });
  keymaster.keypress(110, function(){ self.enterDoorCreation(); });

  keymaster.keydown([38, 87], function(){ self.forwardKeydown(); });
  keymaster.keydown([37, 65], function(){ self.leftwardKeydown(); });
  keymaster.keydown([40, 83], function(){ self.downwardKeydown(); });
  keymaster.keydown([39, 68], function(){ self.rightwardKeydown(); });

  keymaster.keyup([38, 87], function(){ self.forwardKeyup(); });
  keymaster.keyup([37, 65], function(){ self.leftwardKeyup(); });
  keymaster.keyup([40, 83], function(){ self.downwardKeyup(); });
  keymaster.keyup([39, 68], function(){ self.rightwardKeyup(); });

  keymaster.keydown(27, function(){ self.exitDoorCreation(); });

  mousemaster.move(function(x, y, ev) { self.mousemove(x, y, ev); }, 'controls');

  $('.door-texture-option').click(function() {
    self.doorTextureSelected($(this));
  });

  $('#door-name-form').submit(function(e) {
    e.preventDefault();
    self.attemptDoorCreation();
  });

  $('.door-submit-button').click(function() {
    self.attemptDoorCreation();
  });
};

GeneralPlanetComponent.prototype.toggleCameraPerspective = function() {
  if (!this.controlsActive()) return;

  this.firstPerson = !this.firstPerson;

  this.avatar.setVisible(!this.firstPerson);

  var camName = this.firstPerson? FIRST_PERSON_CAM_NAME : THIRD_PERSON_CAM_NAME;
  this.camera.setTarget(camName);
};

GeneralPlanetComponent.prototype.enterDoorCreation = function() {
  if (this.creatingDoor) return;

  this.creatingDoor = true;
  keymaster.setPreventDefaults(false);
  this.cam.exitPointerlock();

  this.creationDoor.setVisible(true);
  var avatarPos = this.avatar.trackingMesh().position;
  this.creationDoor.moveTo(avatarPos.x - 10, 4, avatarPos.z - 5);

  $('.door-ui-wrapper').fadeIn();
  $('#door-name-input').focus();
};

GeneralPlanetComponent.prototype.attemptDoorCreation = function() {
  var self = this;

  var doorData = {
    subject: $('#door-name-input').val(),
    position: this.creationDoor.mesh.position,
    creator: this.avatar._id,
    texture: this.creationDoor.texture
  };

  apiTools.createDoor(doorData, function(result) {
    if (result.error) {
      self.showDoorError(result.error);
    } else {
      self.addDoor(result.door);
      self.exitDoorCreation();
    }
  });
};

GeneralPlanetComponent.prototype.exitDoorCreation = function() {
  if (!this.creatingDoor) return;

  this.creatingDoor = false;
  keymaster.setPreventDefaults(true);
  this.cam.requestPointerlock();
  this.creationDoor.setVisible(false);

  $('.door-ui-wrapper').fadeOut();
};

GeneralPlanetComponent.prototype.showDoorError = function(message) {
  var div = $('.door-error');
  div.text(message);
  div.fadeIn(function() {
    setTimeout(function() {
      div.fadeOut();
    }, 3333);
  });
};

GeneralPlanetComponent.prototype.doorTextureSelected = function(elem) {
  var id = elem.attr('id');

  var textureMap = {
    'wood-door-texture': '/images/wooden_door.jpg',
    'metal-door-texture': '/images/metal_door.jpg',
    'neon-door-texture': '/images/neon_door.jpg',
    'rainbow-door-texture': '/images/rainbow_door.jpg'
  };

  var texture = textureMap[id];
  this.creationDoor.setTexture(texture);
};

GeneralPlanetComponent.prototype.forwardKeydown = function() {
  if (!this.controlsActive()) return;
  this.controls.setForward(true);
};
GeneralPlanetComponent.prototype.leftwardKeydown = function() {
  if (!this.controlsActive()) return;
  this.controls.setLeft(true);
};
GeneralPlanetComponent.prototype.downwardKeydown = function() {
  if (!this.controlsActive()) return;
  this.controls.setBackward(true);
};
GeneralPlanetComponent.prototype.rightwardKeydown = function() {
  if (!this.controlsActive()) return;
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

GeneralPlanetComponent.prototype.mousemove = function(x, y, ev) {
  if (!this.controlsActive()) return;

  var event = ev.originalEvent || ev;
  var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
  this.controls.mouseUpdate(movementX, movementY);
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

GeneralPlanetComponent.prototype.addDoor = function(doorData) {
  var door = new Door(doorData);
  this.addObject3d(door);
};

/** Utility */

GeneralPlanetComponent.prototype.avatarWithName = function(name) {
  return this.avatarsByName[name];
};

GeneralPlanetComponent.prototype.controlsActive = function() {
  return !this.creatingDoor;
};
