
var $ = require('jquery');
var SceneComponent = require('./scene-component');
var Avatar = require('./avatar');
var globals = require('./global-state');

module.exports = BecomeAvatarComponent;

function BecomeAvatarComponent() {};

BecomeAvatarComponent.prototype.__proto__ = SceneComponent.prototype;

BecomeAvatarComponent.prototype.postInit = function() {
  this.avatar = new Avatar({
    position: {x: 0, y: 5, z: -10}
  });
  this.avatar.addTo(this.scene);

  globals.playerAvatar = this.avatar;

  this.renderObjects.push(this.avatar);

  $('#avatar-name-form').submit(function(ev) {
    ev.preventDefault();

    this.avatar.name = $('#avatar-name-input').val();
  });
};

BecomeAvatarComponent.prototype.preRender = function() {
  this.avatar.rotate(0, 0.01, 0);
};

BecomeAvatarComponent.prototype.updateAvatarColor = function(hex) {
  this.avatar.updateSkinColor(hex);
};
