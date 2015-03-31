
var $ = require('jquery');
var AvatarControlComponent = require('./avatar-control-component');
var keymaster = require('./keymaster');
var apiTools = require('./api-tools');

module.exports = InnerDoorComponent;

// Inherited methods

function InnerDoorComponent() {}

InnerDoorComponent.prototype = Object.create(AvatarControlComponent.prototype);

InnerDoorComponent.prototype.postInit = function(options) {
  AvatarControlComponent.prototype.postInit.call(this, options);

  this.door = options.door;
};
