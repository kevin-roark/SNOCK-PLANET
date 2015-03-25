
var $ = require('jquery');
var globals = require('./global-state');
var SceneComponent = require('./scene-component');
var keymaster = require('./keymaster');
var mousemaster = require('./mousemaster');
var Avatar = require('./avatar');
var Door = require('./door');
var ObjectControls = require('./object-controls');
var apiTools = require('./api-tools');

module.exports = InnerDoorComponent;

// Inherited methods

function InnerDoorComponent() {};

// TODO: general avatar-control-component subclass
InnerDoorComponent.prototype.__proto__ = SceneComponent.prototype;

InnerDoorComponent.prototype.postInit = function(options) {
  this.door = options.door;
};
