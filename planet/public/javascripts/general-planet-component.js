
var $ = require('jquery');
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

  this.creatingDoor = false;
  this.creationDoor = new Door();
  this.creationDoor.setVisible(false);
  this.addObject3d(this.creationDoor);

  this.doors = []; // TODO: not sustainable to hold all doors in a freakin' array

  if (this.socket) {
    this.socket.on('door-creation', this.addDoor.bind(this));

    this.socket.emit('get-doors', {position: {x: 0, y: 0, z: 0}}, function(doors) {
      for (var i = 0; i < doors.length; i++) {
        self.addDoor(doors[i]);
      }
    });
  }
};

/** User Interaction */

GeneralPlanetComponent.prototype.addInteractionGlue = function() {
  AvatarControlComponent.prototype.addInteractionGlue.call(this);

  var self = this;

  keymaster.keypress(110, this.enterDoorCreation.bind(this));
  keymaster.keypress(32, this.attemptToEnterNearestDoor.bind(this));

  keymaster.keydown(27, this.exitDoorCreation.bind(this));

  $('.door-texture-option').click(function() {
    self.doorTextureSelected($(this));
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
  var avatarPosition = this.avatar.trackingMesh().position;

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
    console.log('should enter: ' + nearestDoor);
  }
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

/** IO Response */

GeneralPlanetComponent.prototype.addDoor = function(doorData) {
  var door = new Door(doorData);
  this.addObject3d(door);
  this.doors.push(door);
};
