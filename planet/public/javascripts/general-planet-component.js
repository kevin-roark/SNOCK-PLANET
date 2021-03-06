
var $ = require('jquery');

var config = require('./config');
var AvatarControlComponent = require('./avatar-control-component');
var keymaster = require('./keymaster');
var Door = require('./door');
var apiTools = require('./api-tools');
var formValidator = require('./form-validator');

module.exports = GeneralPlanetComponent;

/** Constants */

var MINIMUM_REQUIRED_DOOR_ENTRY_DISTANCE = 30;
var SUPER_CLOSE_DOOR_DISTANCE = 5;

/** Inherited methods */

function GeneralPlanetComponent() {}

GeneralPlanetComponent.prototype = Object.create(AvatarControlComponent.prototype);

GeneralPlanetComponent.prototype.postInit = function(options) {
  AvatarControlComponent.prototype.postInit.call(this, options);
  this.identifier = 'outer planet';

  var self = this;

  this.creationDoor = new Door();
  this.addSheenModel(this.creationDoor, function() {
    self.creationDoor.setVisible(false);
  });

  this.doors = [];
  this.doorSet = {};

  if (this.socket) {
    // load every avatar that exists in outer-level planet (sleeping, awake) and add them to scene
    apiTools.getAvatars(null, function(avatars) {
      self.handleMyAvatars(avatars);
    });

    // when a new door is created, we add it to our world
    this.socket.on('door-created', this.addDoor.bind(this));

    // get all the doors that exist, and put them into scene
    apiTools.getDoors({x: 0, y: 0, z: 0}, function(doors) {
      for (var i = 0; i < doors.length; i++) {
        self.addDoor(doors[i]);
      }
    });
  }
};

GeneralPlanetComponent.prototype.postRender = function() {
  AvatarControlComponent.prototype.postRender.call(this);

  var shouldRenderDoors = this.frameCount % 6 === 0;
  if (shouldRenderDoors) {
    for (var i = 0; i < this.doors.length; i++) {
      this.doors[i].render();
    }
  }
};

GeneralPlanetComponent.prototype.restore = function() {
  AvatarControlComponent.prototype.restore.call(this);

  this.avatar.currentDoor = null;

  if (this.savedPosition) {
    this.controls.active = false;
    this.avatar.moveTo(this.savedPosition);
    this.controls.active = true;
  }
  else {
    this.avatar.moveTo(0, 0, 0);
  }
};

/** User Interaction */

GeneralPlanetComponent.prototype.addInteractionGlue = function() {
  AvatarControlComponent.prototype.addInteractionGlue.call(this);

  var self = this;

  keymaster.keypress(32, this.attemptToEnterNearestDoor.bind(this));

  $('.door-texture-option').click(function() {
    self.doorTextureSelected($(this));
  });

  $('.door-wall-option').click(function() {
    self.doorWallTextureSelected($(this));
  });

  $('#door-name-input').on('input', function(ev) {
    var newSubject = $(this).val();
    self.updateDoorSubject(newSubject);
  });

  $('#door-name-form').submit(function(e) {
    e.preventDefault();
    self.attemptDoorCreation();
  });

  $('.door-submit-button').click(this.attemptDoorCreation.bind(this));

  $('.door-escape-button').click(this.exitFormCreation.bind(this));
};

GeneralPlanetComponent.prototype.attemptToEnterNearestDoor = function() {
  if (!this.controlsActive()) return;

  var requiredDistanceSquared = MINIMUM_REQUIRED_DOOR_ENTRY_DISTANCE * MINIMUM_REQUIRED_DOOR_ENTRY_DISTANCE;
  var superCloseDistanceSquared = SUPER_CLOSE_DOOR_DISTANCE * SUPER_CLOSE_DOOR_DISTANCE;
  var avatarPosition = this.avatar.mesh.position;

  var minDistanceSquared = 100000000000;
  var nearestDoor = null;
  for (var i = 0; i < this.doors.length; i++) {
    var door = this.doors[i];
    var distSquared = door.mesh.position.distanceToSquared(avatarPosition);

    if (distSquared < minDistanceSquared) {
      minDistanceSquared = distSquared;
      nearestDoor = door;

      if (distSquared < superCloseDistanceSquared) {
        break;
      }
    }
  }

  if (nearestDoor && minDistanceSquared <= requiredDistanceSquared) {
    if (this.enterDoorCallback) {
      this.savedPosition = this.avatar.mesh.position.clone();

      this.enterDoorCallback(nearestDoor);
    }
  }
};

GeneralPlanetComponent.prototype.enterFormCreation = function() {
  if (!AvatarControlComponent.prototype.enterFormCreation.call(this)) {
    return false;
  }

  this.creationDoor.setVisible(true);
  var avatarPos = this.avatar.mesh.position;
  var avatarRot = this.avatar.mesh.rotation;

  var offsetVector = new THREE.Vector3(-24, 0, 15);
  var yAxis = new THREE.Vector3(0, 1, 0);
  var yRotation = avatarRot.y;
  offsetVector.applyAxisAngle(yAxis, yRotation);

  this.creationDoor.moveTo(avatarPos.x + offsetVector.x, 4, avatarPos.z + offsetVector.z);
  this.creationDoor.rotateTo(0, yRotation, 0);

  $('.door-ui-wrapper').fadeIn();

  $('#door-name-input').val('');
  $('#door-name-input').focus();

  $('.texture-option').removeClass('selected-texture');

  return true;
};

GeneralPlanetComponent.prototype.attemptDoorCreation = function() {
  var self = this;

  this.creationDoor.creator = this.avatar._id;

  var doorData = this.creationDoor.serialize();

  if (!formValidator.isValidDoorSubject(doorData.subject)) {
    self.showError('invalid name. letters, numbers, spaces, underscores. reasonable length.', 4444);
    return;
  }

  apiTools.createDoor(doorData, function(result) {
    if (result.error) {
      self.showError(result.error);
    } else {
      self.addDoor(result.door);
      self.exitFormCreation();
    }
  });
};

GeneralPlanetComponent.prototype.exitFormCreation = function() {
  if (!AvatarControlComponent.prototype.exitFormCreation.call(this)) {
    return false;
  }

  this.creationDoor.setVisible(false);
  $('.door-ui-wrapper').fadeOut();

  return true;
};

GeneralPlanetComponent.prototype.updateDoorSubject = function(subject) {
  this.currentlyEnteredSubject = subject;
  this.creationDoor.setSubject(subject);
};

GeneralPlanetComponent.prototype.doorTextureSelected = function(elem) {
  var id = elem.attr('id');

  var doorTextures = config.door_textures;

  var textureMap = {
    'wood-door-texture': doorTextures.wood,
    'metal-door-texture': doorTextures.metal,
    'neon-door-texture': doorTextures.neon,
    'rainbow-door-texture': doorTextures.rainbow
  };

  var texture = textureMap[id];
  if (texture) {
    $('.door-texture-option').removeClass('selected-texture');
    elem.addClass('selected-texture');
    this.creationDoor.setTexture(texture);
  }
};

GeneralPlanetComponent.prototype.doorWallTextureSelected = function(elem) {
  var id = elem.attr('id');

  var wallTextures = config.room_textures;

  var textureMap = {
    'door-wall-factory': wallTextures.factory,
    'door-wall-farm': wallTextures.farm,
    'door-wall-girl': wallTextures.girl,
    'door-wall-space': wallTextures.space,
    'door-wall-underwater': wallTextures.underwater
  };

  var texture = textureMap[id];
  if (texture) {
    $('.door-wall-option').removeClass('selected-texture');
    elem.addClass('selected-texture');
    this.creationDoor.wallTexture = texture;
  }
};

/** IO Response */

GeneralPlanetComponent.prototype.addDoor = function(doorData) {
  if (doorData) {
    if (this.doorSet[doorData._id]) {
      return; // door already exists !!!
    }

    this.doorSet[doorData._id] = true;
  }

  var door = new Door(doorData);
  this.doors.push(door);

  var self = this;
  door.addTo(this.scene, function() {
    self.additionalMeshes.push(door.mesh);
  });
};
