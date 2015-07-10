
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
    position: {x: -13, y: -2, z: -25}
  });

  globals.playerAvatar = this.avatar;
  this.addObject3d(this.avatar, function() {
    self.avatar.setVisible(false);
    self.setAvatarCameraTarget();
  });

  this.setupFiledropper();
  this.startTitleRainbow();
  this.checkLocalStorage();

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

      self.hideExistingAvatarUI();
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

BecomeAvatarComponent.prototype.clean = function() {
  SceneComponent.prototype.clean.call(this);
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

  $('#avatar-image-drop-zone').text('DROP OR CLICK YOUR FACE HERE');

  imageDropper.previewCallback = function(renderedCanvas) {
    self.avatar.updateFaceImage(renderedCanvas);
  };

  imageDropper.init();
};

BecomeAvatarComponent.prototype.startTitleRainbow = function() {
  var rainbowColors = [
        '#FF0000',
        '#f26522',
        '#fff200',
        '#00a651',
        '#28abe2',
        '#2e3192',
        '#6868ff'
    ];

    this.rainbowOptions = {
        colors: rainbowColors,
        animate: true,
        animateInterval: 100,
        pad: false,
        pauseLength: 100
    };

    $('.snock-title').rainbow(this.rainbowOptions);
};

BecomeAvatarComponent.prototype.checkLocalStorage = function() {
  var lastEnteredName = localStorage.getItem('lastEnteredAvatarName');
  if (lastEnteredName) {
    $('#avatar-name-input').val(lastEnteredName);
    $('.avatar-form-descriptor').text('BECOME WHO YOU WERE / OR CHOOSE A NEW YOU');
  }
};

BecomeAvatarComponent.prototype.hideExistingAvatarUI = function() {
  var self = this;

  $('.snock-title').fadeOut(function() {
    clearInterval(self.rainbowOptions.interval);
  });
};

BecomeAvatarComponent.prototype.enterAvatarCreationState = function() {
  var name = $('#avatar-name-input').val();
  $('#avatar-name-input').val('');
  $('#avatar-name-input').blur();
  $('.avatar-form-descriptor').text('YOUR CHANCE TO MAKE YOU / SELECT AVATAR COLOR / DRAG IMAGE TO CHANGE FACE / PERMANENT ONCE YOU ENTER');

  $('.avatar-creation-submit-button').fadeIn();
  $('.avatar-color-picker').fadeIn();
  $('#avatar-image-drop-zone').fadeIn();

  this.activateColorPicker();
  this.layout();

  var self = this;
  $('.avatar-name-form-wrapper').animate({
    top: 60
  }, function() {
    $('#avatar-name-input').val(name);
    self.avatar.setVisible(true);
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
  this.avatar.setVisible(true);
  this.commonFinish(avatarData);
};

BecomeAvatarComponent.prototype.finishAfterCreatingAvatar = function(avatarData) {
  this.commonFinish(avatarData);
};

BecomeAvatarComponent.prototype.commonFinish = function(avatarData) {
  localStorage.setItem('lastEnteredAvatarName', avatarData.name);

  this.avatar.updateFromModel(avatarData);
  this.avatar.wakeUp();
  this.avatar.moveTo(this.avatar.mesh.position.x, 0, this.avatar.mesh.position.z);

  this.markFinished();
};
