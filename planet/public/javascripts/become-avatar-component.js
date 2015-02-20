
var $ = require('jquery');
var SceneComponent = require('./scene-component');
var Avatar = require('./avatar');
var globals = require('./global-state');
var avatarTools = require('./avatar-tools');

module.exports = BecomeAvatarComponent;

/** Inherited methods */

function BecomeAvatarComponent() {};

BecomeAvatarComponent.prototype.__proto__ = SceneComponent.prototype;

BecomeAvatarComponent.prototype.postInit = function(options) {
  var self = this;

  this.avatar = new Avatar({
    position: {x: -15, y: 10, z: -20}
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
  var tests = {
    filereader: typeof FileReader != 'undefined',
    dnd: 'draggable' in document.createElement('span'),
    formdata: !!window.FormData,
    progress: "upload" in new XMLHttpRequest
  };

  var acceptedTypes = {
    'image/png': true,
    'image/jpeg': true,
    'image/gif': true
  };

  var holder = document.getElementById('avatar-image-drop-zone');
  var progress = document.getElementById('upload-progress');

  function previewfile(file) {
    if (tests.filereader === true && acceptedTypes[file.type] === true) {
      var reader = new FileReader();
      reader.onload = function (event) {
        var image = new Image();
        image.src = event.target.result;
        image.width = 250; // a fake resize
        holder.appendChild(image);
      };

      reader.readAsDataURL(file);
    }
  }

  function readfiles(files) {
    var formData = tests.formdata ? new FormData() : null;
    for (var i = 0; i < files.length; i++) {
      if (tests.formdata) {
        formData.append('file', files[i]);
      }
      previewfile(files[i]);
    }

    // now post a new XHR request
    if (tests.formdata) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/devnull.php');
      xhr.onload = function() {
        progress.value = progress.innerHTML = 100;
      };

      if (tests.progress) {
        xhr.upload.onprogress = function (event) {
          if (event.lengthComputable) {
            var complete = (event.loaded / event.total * 100 | 0);
            progress.value = progress.innerHTML = complete;
          }
        }
      }

      xhr.send(formData);
    }
  }

  if (tests.dnd) {
    holder.ondragover = function () {
      this.className = 'hover';
      return false;
    };
    holder.ondragend = function () {
      this.className = '';
      return false;
    };
    holder.ondrop = function (e) {
      this.className = '';
      e.preventDefault();
      readfiles(e.dataTransfer.files);
    }
  } else {
    fileupload.className = 'hidden';
    fileupload.querySelector('input').onchange = function () {
      readfiles(this.files);
    };
  }
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
    self.avatar.addTo(self.scene);
    $('#avatar-name-input').val(name);
  });
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
