
var $ = require('jquery');
var SceneComponent = require('./scene-component');
var Avatar = require('./avatar');
var globals = require('./global-state');
var avatarTools = require('./avatar-tools');

module.exports = BecomeAvatarComponent;

function BecomeAvatarComponent() {};

BecomeAvatarComponent.prototype.__proto__ = SceneComponent.prototype;

BecomeAvatarComponent.prototype.postInit = function() {
  this.avatar = new Avatar({
    position: {x: 0, y: 5, z: -20}
  });
  this.avatar.addTo(this.scene);

  globals.playerAvatar = this.avatar;

  this.renderObjects.push(this.avatar);

  this.hasEnteredName = false;

  $('#avatar-name-input').focus();

  var self = this;
  $('#avatar-name-form').submit(function(ev) {
    ev.preventDefault();
    var name = $('#avatar-name-input').val();

    if (!self.hasEnteredName) {
      avatarTools.fetchAvatar(name, function(avatarData) {
        if (avatarData) {
          self.finishAfterFetchingAvatar(avatarData);
        } else {
          self.enterAvatarCreationState();
        }
      });
    }

    self.hasEnteredName = true;
  });

  $('.avatar-creation-submit-button').click(function() {
    avatarTools.createAvatar(self.avatar.serialize(), function(avatarData) {
      self.finishAfterCreatingAvatar(avatarData);
    });
  });
};

BecomeAvatarComponent.prototype.preRender = function() {
  this.avatar.rotate(0, 0.01, 0);
};

BecomeAvatarComponent.prototype.updateAvatarColor = function(hex) {
  this.avatar.updateSkinColor(hex);
};

BecomeAvatarComponent.prototype.updateAvatarFaceImage = function(imageUrl) {
  this.avatar.updateFaceImage(imageUrl);
};

BecomeAvatarComponent.prototype.activateColorPicker = function() {
  var self = this;
  var slider = document.getElementById('avatar-color-picker-slider');
  var picker = document.getElementById('avatar-color-picker-picker');
  ColorPicker(slider, picker, function(hex, hsv, rgb) {
    self.updateAvatarColor(hex);
  });
};

BecomeAvatarComponent.prototype.activateDropzone = function() {
  this.dropzone = new Dropzone('div.avatar-face-image-picker', {
    url: '/avatar-face-upload',
    thumbnailWidth: 100,
    dictDefaultMessage: 'drag and drop a facial image here'
  });
};

BecomeAvatarComponent.prototype.enterAvatarCreationState = function() {
  var name = $('#avatar-name-input').val();
  $('#avatar-name-input').val('');
  $('.avatar-avatar-creation-submit-button').focus();

  var self = this;
  $('.avatar-creation-submit-button').fadeIn();
  $('#avatar-name-input').animate({
    top: 60
  }, function() {
    $('#avatar-name-input').val(name);
    self.activateDropzone();
    self.activateColorPicker();
  });
};

BecomeAvatarComponent.prototype.finishAfterFetchingAvatar = function(avatarData) {
  this.avatar.name = avatarData.name;
  this.updateAvatarColor(avatarData.color);
  this.updateAvatarFaceImage(avatarData.faceImageUrl);

  this.markFinished();
};

BecomeAvatarComponent.prototype.finishAfterCreatingAvatar = function() {

};
