
var $ = require('jquery');

var config = require('./config');
var AvatarControlComponent = require('./avatar-control-component');
var keymaster = require('./keymaster');
var Door = require('./door');
var apiTools = require('./api-tools');

module.exports = GeneralPlanetComponent;

/** Constants */

var MINIMUM_REQUIRED_DOOR_ENTRY_DISTANCE = 30;

/** Inherited methods */

function GeneralPlanetComponent() {}

GeneralPlanetComponent.prototype = Object.create(AvatarControlComponent.prototype);

GeneralPlanetComponent.prototype.postInit = function(options) {
  AvatarControlComponent.prototype.postInit.call(this, options);

  var self = this;

  this.creationDoor = new Door();
  this.addObject3d(this.creationDoor, function() {
    self.creationDoor.setVisible(false);
  });

  this.doors = []; // TODO: not sustainable to hold all doors in a freakin' array
  this.doorSet = {};

  if (this.socket) {
    this.socket.on('door-created', this.addDoor.bind(this));

    apiTools.getDoors({x: 0, y: 0, z: 0}, function(doors) {
      for (var i = 0; i < doors.length; i++) {
        self.addDoor(doors[i]);
      }
    });
  }
};

GeneralPlanetComponent.prototype.restore = function() {
  AvatarControlComponent.prototype.restore.call(this);

  this.avatar.currentDoor = null;

  if (this.savedPosition) {
    this.avatar.moveTo(this.savedPosition);
  }
};

GeneralPlanetComponent.prototype.updatedAvatarsState = function(avatarsState) {
  var planetAvatars = avatarsState.planet;
  for (var i = 0; i < planetAvatars.length; i++) {
    var avatarData = planetAvatars[i];
    this.avatarUpdate(avatarData);
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

  $('#door-name-form').submit(function(e) {
    e.preventDefault();
    self.attemptDoorCreation();
  });

  $('.door-submit-button').click(this.attemptDoorCreation.bind(this));
};

GeneralPlanetComponent.prototype.attemptToEnterNearestDoor = function() {
  if (!this.controlsActive()) return;

  var requiredDistanceSquared = MINIMUM_REQUIRED_DOOR_ENTRY_DISTANCE * MINIMUM_REQUIRED_DOOR_ENTRY_DISTANCE;
  var avatarPosition = this.avatar.mesh.position;

  var minDistanceSquared = 100000000000;
  var nearestDoor = null;
  for (var i = 0; i < this.doors.length; i++) {
    var door = this.doors[i];
    var distSquared = door.mesh.position.distanceToSquared(avatarPosition);
    if (distSquared < minDistanceSquared) {
      minDistanceSquared = distSquared;
      nearestDoor = door;
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
  AvatarControlComponent.prototype.enterFormCreation.call(this);

  this.creationDoor.setVisible(true);
  var avatarPos = this.avatar.mesh.position;
  this.creationDoor.moveTo(avatarPos.x - 10, 4, avatarPos.z - 5);

  $('.door-ui-wrapper').fadeIn();

  $('#door-name-input').val('');
  $('#door-name-input').focus();

  $('.texture-option').removeClass('selected-texture');
};

GeneralPlanetComponent.prototype.attemptDoorCreation = function() {
  var self = this;

  this.creationDoor.subject = $('#door-name-input').val();
  this.creationDoor.creator = this.avatar._id;

  var doorData = this.creationDoor.serialize();

  apiTools.createDoor(doorData, function(result) {
    if (result.error) {
      self.showError('.door-error', result.error);
    } else {
      self.addDoor(result.door);
      self.exitFormCreation();
    }
  });
};

GeneralPlanetComponent.prototype.exitFormCreation = function() {
  AvatarControlComponent.prototype.exitFormCreation.call(this);

  this.creationDoor.setVisible(false);
  $('.door-ui-wrapper').fadeOut();
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
  this.addObject3d(door);
  this.doors.push(door);
};
