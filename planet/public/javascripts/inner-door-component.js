
var $ = require('jquery');
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

  this.room = skybox.create(2000);
  this.addMesh(this.room);

  if (this.socket) {
    this.socket.on('note-creation', this.addNote.bind(this));

    apiTools.getNotes(this.door._id, function(notes) {
      for (var i = 0; i < notes.length; i++) {
        self.addNote(notes[i]);
      }
    });
  }

  var testNote = new Note({
    text: 'JOIN MY PLANET',
    position: {x: 0, z: 40}
  });
  this.addObject3d(testNote);
};

InnerDoorComponent.prototype.addInteractionGlue = function() {
  AvatarControlComponent.prototype.addInteractionGlue.call(this);

  keymaster.keydown(27, this.exit.bind(this));

  var self = this;
  $('#message-content-form').submit(function(e) {
    e.preventDefault();
    self.attemptNoteCreation();
  });
  $('.message-submit-button').click(this.attemptNoteCreation.bind(this));
};

InnerDoorComponent.prototype.enterFormCreation = function() {
  AvatarControlComponent.prototype.enterFormCreation.call(this);

  $('.message-ui-wrapper').fadeIn();
  $('#message-content-input').focus();
};

InnerDoorComponent.prototype.exitFormCreation = function() {
  if (!this.inCreationMode) {
    this.exit();
    return;
  }

  AvatarControlComponent.prototype.exitFormCreation.call(this);

  $('.message-ui-wrapper').fadeOut();
};

InnerDoorComponent.prototype.attemptNoteCreation = function() {
  var self = this;

  var avatarPosition = this.avatar.trackingMesh().position;

  var noteData = {
    text: $('#message-content-input').val(),
    position: {x: avatarPosition.x, y: 0, z: avatarPosition.z},
    creator: this.avatar._id,
    door: this.door._id
  };

  apiTools.createNote(noteData, function(result) {
    if (result.error) {
      self.showError('.message-error', result.error);
      console.log('i choose to show error');
    } else {
      console.log('i choose to add note');
      self.addNote(result.note);
      console.log('why not exit form creation??');
      self.exitFormCreation();
    }
  });
};

InnerDoorComponent.prototype.addNote = function(noteData) {
  var note = new Note(noteData);
  this.addObject3d(note);
};

InnerDoorComponent.prototype.exit = function() {
  this.markFinished();
};
