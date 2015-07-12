
var $ = require('jquery');

var config = require('./config');
var AvatarControlComponent = require('./avatar-control-component');
var keymaster = require('./keymaster');
var apiTools = require('./api-tools');
var skybox = require('./skybox');
var Note = require('./note');

module.exports = InnerDoorComponent;

// Inherited methods

function InnerDoorComponent() {}

InnerDoorComponent.prototype = Object.create(AvatarControlComponent.prototype);

InnerDoorComponent.prototype.postInit = function(options) {
  AvatarControlComponent.prototype.postInit.call(this, options);

  var self = this;

  this.door = options.door;

  this.notes = [];
  this.noteSet = {};

  this.avatar.currentDoor = this.door;
  this.avatar.moveTo(0, 0, 0);

  this.room = skybox.create(2000, this.door.wallTexture);
  this.addMesh(this.room);

  if (this.socket) {
    this.socket.on('note-created', this.addNote.bind(this));

    apiTools.getNotes(this.door._id, function(notes) {
      for (var i = 0; i < notes.length; i++) {
        self.addNote(notes[i]);
      }
    });
  }
};

InnerDoorComponent.prototype.controlsOptions = function() {
  var options =  AvatarControlComponent.prototype.controlsOptions.call(this);
  options.fenceDistance = 1000;
  return options;
};

InnerDoorComponent.prototype.updatedAvatarsState = function(avatarsState) {
  var avatarsWithinDoors = avatarsState.doors;
  var avatarsInThisDoor = avatarsWithinDoors[this.door._id];
  if (avatarsInThisDoor) {
    for (var i = 0; i < avatarsInThisDoor.length; i++) {
      var avatarData = avatarsInThisDoor[i];
      this.avatarUpdate(avatarData);
    }
  }
};

InnerDoorComponent.prototype.addInteractionGlue = function() {
  AvatarControlComponent.prototype.addInteractionGlue.call(this);

  keymaster.keypress(122, this.exit.bind(this)); // z to exit

  var self = this;

  $('.note-texture-option').click(function() {
    self.noteTextureSelected($(this));
  });

  $('#message-content-form').submit(function(e) {
    e.preventDefault();
    self.attemptNoteCreation();
  });

  $('.message-submit-button').click(this.attemptNoteCreation.bind(this));

  $('.message-escape-button').click(this.exitFormCreation.bind(this));
};

InnerDoorComponent.prototype.enterFormCreation = function() {
  if (!AvatarControlComponent.prototype.enterFormCreation.call(this)) {
    return false;
  }

  $('.message-ui-wrapper').fadeIn();
  $('#message-content-input').focus();

  $('.texture-option').removeClass('selected-texture');

  return true;
};

InnerDoorComponent.prototype.exitFormCreation = function() {
  if (this.inCreationMode) {
    $('.message-ui-wrapper').fadeOut();
  }

  return AvatarControlComponent.prototype.exitFormCreation.call(this);
};

InnerDoorComponent.prototype.noteTextureSelected = function(elem) {
  var id = elem.attr('id');

  var noteTextures = config.note_textures;

  var textureMap = {
    'note-texture-paper': noteTextures.paper,
    'note-texture-tablet': noteTextures.tablet,
    'note-texture-ipad': noteTextures.ipad,
    'note-texture-googledocs': noteTextures.googledocs,
    'note-texture-chalkboard': noteTextures.chalkboard
  };

  var texture = textureMap[id];
  if (texture) {
    $('.note-texture-option').removeClass('selected-texture');
    elem.addClass('selected-texture');
    this.creationDoor.wallTexture = texture;
  }
};

InnerDoorComponent.prototype.attemptNoteCreation = function() {
  var self = this;

  var avatarPosition = this.avatar.mesh.position;

  var noteData = {
    text: $('#message-content-input').val(),
    position: {x: avatarPosition.x, y: 0, z: avatarPosition.z},
    creator: this.avatar._id,
    door: this.door._id
  };

  apiTools.createNote(noteData, function(result) {
    if (result.error) {
      self.showFormError('.message-error', result.error);
    } else {
      self.addNote(result.note);
      self.exitFormCreation();
    }
  });
};

InnerDoorComponent.prototype.addNote = function(noteData) {
  if (noteData._id) {
    if (this.noteSet[noteData._id]) {
      return; // already in here....
    }

    this.noteSet[noteData._id] = true;
  }

  var note = new Note(noteData);
  this.addObject3d(note);
  this.notes.push(note);
};

InnerDoorComponent.prototype.exit = function() {
  if (this.inCreationMode) {
    return;
  }

  this.markFinished();
};
