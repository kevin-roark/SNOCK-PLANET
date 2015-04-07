
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

  this.writingNote = false;

  this.room = skybox.create(2000);
  this.addMesh(this.room);

  $('#message-content-form').submit(function(e) {
    e.preventDefault();
    self.attemptNoteCreation();
  });
  $('.message-submit-button').click(this.attemptNoteCreation.bind(this));

  var testNote = new Note({
    text: 'JOIN MY PLANET',
    position: {x: 0, z: 40}
  });
  this.addObject3d(testNote);
};

InnerDoorComponent.prototype.addInteractionGlue = function() {
  AvatarControlComponent.prototype.addInteractionGlue.call(this);

  keymaster.keydown(27, this.exit.bind(this));
};

InnerDoorComponent.prototype.enterFormCreation = function() {
  if (this.writingNote) return;

  this.writingNote = true;
  keymaster.setPreventDefaults(false);
  this.cam.exitPointerlock();

  var avatarPos = this.avatar.trackingMesh().position;
  this.creationDoor.moveTo(avatarPos.x - 10, 4, avatarPos.z - 5);

  $('.message-ui-wrapper').fadeIn();
  $('#message-content-input').focus();
};

InnerDoorComponent.prototype.attemptNoteCreation = function() {
  var self = this;

  var noteData = {
    subject: $('#message-content-input').val(),
    position: this.creationDoor.mesh.position,
    creator: this.avatar._id,
    texture: this.creationDoor.texture
  };

  apiTools.createNote(noteData, function(result) {
    if (result.error) {
      self.showError('.message-error', result.error);
    } else {
      self.addNote(result.door);
      self.exitDoorCreation();
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
