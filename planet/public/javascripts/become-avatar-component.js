
var $ = require('jquery');
var SceneComponent = require('./scene-component');
var Avatar = require('./avatar');
var globals = require('./global-state');
var apiTools = require('./api-tools');
var imageDropper = require('./image-dropper');

module.exports = BecomeAvatarComponent;

/** Inherited methods */

function BecomeAvatarComponent() {}

BecomeAvatarComponent.prototype = Object.create(SceneComponent.prototype);

BecomeAvatarComponent.prototype.postInit = function(options) {
  var self = this;

  this.avatar = new Avatar({
    position: {x: -13, y: 0, z: -25}
  });

  globals.playerAvatar = this.avatar;
  this.renderObjects.push(this.avatar);

  this.setupFiledropper();

  this.hasEnteredName = false;
  $('#avatar-name-input').focus();
  $('#avatar-name-form').submit(function(ev) {
    ev.preventDefault();
    var name = $('#avatar-name-input').val();

    if (!self.hasEnteredName) {
      apiTools.fetchAvatar(name, function(avatarData) {
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

    apiTools.createFaceURL(self.avatar.uploadableFaceImageData(), function(faceURL) {
      self.avatar.updateFaceImage(faceURL);
      apiTools.createAvatar(self.avatar.serialize(), function(avatarData) {
        self.finishAfterCreatingAvatar(avatarData);
      });
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

BecomeAvatarComponent.prototype.clean = function() {
  $('.avatar-ui-wrapper').fadeOut();
};

/** "custom" methods */

BecomeAvatarComponent.prototype.updateAvatarFaceImage = function(imageUrl) {
  this.avatar.updateFaceImage(imageUrl);
};

BecomeAvatarComponent.prototype.activateColorPicker = function() {
  var self = this;
  var slider = document.getElementById('avatar-color-picker-slider');
  var picker = document.getElementById('avatar-color-picker-picker');
  ColorPicker(slider, picker, function(hex, hsv, rgb) {
    self.avatar.updateSkinColor(hex);
  });
};

BecomeAvatarComponent.prototype.setupFiledropper = function() {
  var self = this;

  imageDropper.previewCallback = function(renderedCanvas) {
    self.avatar.updateFaceImage(renderedCanvas);
  };

  imageDropper.init();
};

BecomeAvatarComponent.prototype.enterAvatarCreationState = function() {
  var name = $('#avatar-name-input').val();
  $('#avatar-name-input').val('');
  $('#avatar-name-input').blur();

  $('.avatar-creation-submit-button').fadeIn();
  $('.avatar-color-picker').fadeIn();
  $('#avatar-image-drop-zone').fadeIn();
  this.activateColorPicker();
  this.layout();

  var self = this;
  $('#avatar-name-input').animate({
    top: 60
  }, function() {
    $('#avatar-name-input').val(name);
    self.avatar.addTo(self.scene, function() {
      self.setAvatarCameraTarget();
    });
  });
};

BecomeAvatarComponent.prototype.setAvatarCameraTarget = function() {
  this.camera.addTarget({
    name: 'create-avatar-target',
    targetObject: new THREE.Object3D(),
    cameraPosition: new THREE.Vector3(0, 0, 0),
    fixed: true
  });
  this.camera.setTarget('create-avatar-target');
};

BecomeAvatarComponent.prototype.finishAfterFetchingAvatar = function(avatarData) {
  this.avatar.addTo(this.scene);
  this.avatar.updateFromModel(avatarData);
  this.markFinished();
};

BecomeAvatarComponent.prototype.finishAfterCreatingAvatar = function(avatarData) {
  this.avatar.updateFromModel(avatarData);
  this.markFinished();
};

/** layout functions */

function layoutColorPicker() {
  setWidthEqualToHeight($('#avatar-color-picker-picker'));
}

function layoutFacePicker() {
  setWidthEqualToHeight($('#avatar-image-drop-zone'));
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
