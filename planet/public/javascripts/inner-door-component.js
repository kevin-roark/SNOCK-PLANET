
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

  this.door = options.door;

  this.room = skybox.create(2000);
  this.addMesh(this.room);

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

InnerDoorComponent.prototype.exit = function() {
  this.markFinished();
};
