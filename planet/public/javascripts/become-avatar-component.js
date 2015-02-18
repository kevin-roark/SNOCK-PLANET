
var $ = require('jquery');
var SceneComponent = require('./scene-component');
var Avatar = require('./avatar');
var globals = require('./global-state');
var avatarTools = require('./avatar-tools');

module.exports = BecomeAvatarComponent;

/** Inherited methods */

function BecomeAvatarComponent() {};

BecomeAvatarComponent.prototype.__proto__ = SceneComponent.prototype;

BecomeAvatarComponent.prototype.postInit = function() {
  this.avatar = new Avatar({
    position: {x: -15, y: 10, z: -20}
  });

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
    self.avatar.name = $('#avatar-name-input').val();

    avatarTools.createAvatar(self.avatar.serialize(), function(avatarData) {
      self.finishAfterCreatingAvatar(avatarData);
    });
  });
};

BecomeAvatarComponent.prototype.preRender = function() {
  this.avatar.rotate(0, 0.01, 0);
};

BecomeAvatarComponent.prototype.layout = function() {
  layoutColorPicker();
  layoutFacePicker();
  layoutSubmitButton();
};

/** "custom" methods */

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
  $('#avatar-name-input').blur();

  $('.avatar-creation-submit-button').fadeIn();
  $('.avatar-color-picker').fadeIn();
  $('.avatar-face-image-picker').fadeIn();
  this.activateColorPicker();
  this.activateDropzone();
  this.layout();

  var self = this;
  $('#avatar-name-input').animate({
    top: 60
  }, function() {
    self.avatar.addTo(self.scene);
    $('#avatar-name-input').val(name);
  });
};

BecomeAvatarComponent.prototype.finishAfterFetchingAvatar = function(avatarData) {
  this.avatar.addTo(this.scene);

  this.avatar.name = avatarData.name;
  this.updateAvatarColor(avatarData.color);
  this.updateAvatarFaceImage(avatarData.faceImageUrl);

  this.markFinished();
};

BecomeAvatarComponent.prototype.finishAfterCreatingAvatar = function() {

};

/** layout functions */

function layoutColorPicker() {
  setWidthEqualToHeight($('#avatar-color-picker-picker'));
}

function layoutFacePicker() {
  setWidthEqualToHeight($('.avatar-face-image-picker'));
}

function layoutSubmitButton() {
  var button = $('.avatar-creation-submit-button');
  setWidthEqualToHeight(button);

  var height = button.height();
  button.css('border-radius', (height / 2) + 'px');
  button.css('line-height', height + 'px');
  button.css('top', (window.innerHeight / 2 - height / 2) + 'px');
  button.css('left', (window.innerWidth / 2 - button.width() / 2) + 'px');
}

function setWidthEqualToHeight($el) {
  var height = $el.height();
  $el.css('width', height + 'px');
}
