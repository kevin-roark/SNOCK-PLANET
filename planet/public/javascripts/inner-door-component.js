
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
  this.identifier = 'inner door';

  var self = this;

  this.door = options.door;

  this.notes = [];
  this.noteSet = {};

  this.avatar.currentDoor = this.door;
  this.avatar.moveTo(0, 0, 0);

  this.room = skybox.create(2000, this.door.wallTexture);
  this.addMesh(this.room);

  if (this.socket) {
    // when a new note is created in this room, add it in realtime
    this.socket.on('note-created', function(noteData) {
      if (noteData.door === self.door._id) {
        self.addNote(noteData);
      }
    });

    // get all of the avatars currently in this door (asleep and awake) and add them to scene
    apiTools.getAvatars(this.door._id, function(avatars) {
      self.handleMyAvatars(avatars);
    });

    // get all the notes that are currently in this room and add them to the scene
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

InnerDoorComponent.prototype.addInteractionGlue = function() {
  AvatarControlComponent.prototype.addInteractionGlue.call(this);

  keymaster.keypress(122, this.exit.bind(this)); // z to exit

  var self = this;

  $('.note-texture-option').click(function() {
    self.noteTextureSelected($(this));
  });

  $('#message-content-form').submit(function(e) {
    e.preventDefault();
  });

  $('.message-submit-button').click(this.attemptNoteCreation.bind(this));

  $('.message-escape-button').click(this.exitFormCreation.bind(this));
};

InnerDoorComponent.prototype.clean = function() {
  AvatarControlComponent.prototype.clean.call(this);

  $('.note-texture-option').off('click');
  $('#message-content-form').off('submit');
  $('.message-submit-button').off('click');
  $('.message-escape-button').off('click');
};

InnerDoorComponent.prototype.enterFormCreation = function() {
  if (!AvatarControlComponent.prototype.enterFormCreation.call(this)) {
    return false;
  }

  $('.message-ui-wrapper').fadeIn();
  $('#message-content-input').focus();
  $('#message-content-input').val('');

  $('.texture-option').removeClass('selected-texture');
  this.freshNoteAccentTexture = null;

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
    this.freshNoteAccentTexture = texture;
  }
};

InnerDoorComponent.prototype.attemptNoteCreation = function() {
  var self = this;

  var text = $('#message-content-input').val();
  if (text.length > 4096) {
    this.showError('ur message is too long. 4096 max chars.');
    return;
  }

  var avatarPosition = this.avatar.mesh.position;

  var noteData = {
    text: text,
    position: {x: avatarPosition.x, y: 0, z: avatarPosition.z},
    creator: this.avatar._id,
    door: this.door._id,
    accentTexture: this.freshNoteAccentTexture
  };

  apiTools.createNote(noteData, function(result) {
    if (result.error) {
      self.showError(result.error);
    } else {
      self.addNote(result.note);
      self.exitFormCreation();
    }
  });
};

InnerDoorComponent.prototype.addNote = function(noteData) {
  if (!noteData._id) {
    return;
  }

  if (this.noteSet[noteData._id]) {
    return; // already in here....
  }

  this.noteSet[noteData._id] = noteData;

  var note = new Note(noteData);
  this.addSheenModel(note);
  this.notes.push(note);
};

InnerDoorComponent.prototype.exit = function() {
  if (this.inCreationMode) {
    return;
  }

  this.markFinished();
};
