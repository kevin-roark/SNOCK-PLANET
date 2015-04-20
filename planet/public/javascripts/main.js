
var $ = require('jquery');
var io = require('socket.io-client');

var Camera = require('./camera');
var Door = require('./door');
var config = require('./config');
var globals = require('./global-state');
var BecomeAvatarComponent = require('./become-avatar-component');
var GeneralPlanetComponent = require('./general-planet-component');
var InnerDoorComponent = require('./inner-door-component');

// modes
var BECOME_AVATAR_MODE = 0;
var GENERAL_PLANET_MODE = 1;
var INSIDE_DOOR_MODE = 2;

$(function() {

  var state = {
    frameCount: 0,
    mode: BECOME_AVATAR_MODE
  };
  var socket = io(config.io_url);

  // create renderer
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({antialias: true});
    state.renderMode = 'webgl';
  } catch(e) {
    $('.error').show();
    setTimeout(function() {
      $('.error').fadeOut();
    }, 6666);
    renderer = new THREE.CanvasRenderer();
    state.renderMode = 'canvas';
  }

  renderer.setClearColor(0xffffff, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // create scene
  var scene = new THREE.Scene();

  // TODO: fog

  // soft white light
  var ambientLight = new THREE.AmbientLight( 0x404040 );
  scene.add(ambientLight);

  // create camera
  var cam = new Camera(scene, renderer, {});
  var camera = cam.cam;

  // set up globals
  globals.io = socket;
  globals.renderer = renderer;
  globals.scene = scene;
  globals.camera = cam;

  if (config.testing) {
    if (config.addTestDoor) {
      var doorInFrontOfYou = new Door({
        position: {x: 0, y: 5, z: -15}
      });
      doorInFrontOfYou.addTo(scene);
    }
  }

  // start rendering
  cam.active = true;
  startBecomeAvatarState();
  render();

  // render every frame
  function render() {
    requestAnimationFrame(render);

    state.frameCount += 1;

    // every few frames lets update our state to the server
    if (state.frameCount % 120 === 0 && globals.playerAvatar) {
      updateMyAvatar();
    }

    cam.render();

    switch (state.mode) {
      case BECOME_AVATAR_MODE:
        state.becomeAvatarComponent.render();
        break;
      case GENERAL_PLANET_MODE:
        state.generalPlanetComponent.render();
        break;
      case INSIDE_DOOR_MODE:
        state.currentInnerDoorComponent.render();
        break;
    }

    renderer.render(scene, camera);
  }

  function updateMyAvatar() {
    if (globals.playerAvatar && globals.playerAvatar._id) {
      socket.emit('avatar-update', globals.playerAvatar.serialize());
    }
  }

  // cleanup
  window.onbeforeunload = function() {
    var avatar = globals.playerAvatar;
    if (avatar) {
      avatar.goSleep();
      updateMyAvatar();
    }
  };

  // state transitions

  function startBecomeAvatarState() {
    state.becomeAvatarComponent = new BecomeAvatarComponent();
    state.becomeAvatarComponent.init(scene, socket, cam);
    state.becomeAvatarComponent.finishedCallback = function() {
      startGeneralPlanetState();
    };
  }

  function startGeneralPlanetState() {
    state.mode = GENERAL_PLANET_MODE;

    state.generalPlanetComponent = new GeneralPlanetComponent();
    state.generalPlanetComponent.init(scene, socket, cam);

    state.generalPlanetComponent.enterDoorCallback = function(door) {
      state.generalPlanetComponent.removeObjects();
      state.generalPlanetComponent.clean();

      startInsideDoorState(door);
    };
  }

  function restoreGeneralPlanetState() {
    state.mode = GENERAL_PLANET_MODE;
    state.generalPlanetComponent.restore();
  }

  function startInsideDoorState(door) {
    state.mode = INSIDE_DOOR_MODE;

    state.currentInnerDoorComponent = new InnerDoorComponent();
    state.currentInnerDoorComponent.init(scene, socket, cam, {door: door});
    state.currentInnerDoorComponent.finishedCallback = function() {
      state.currentInnerDoorComponent.removeObjects();
      state.currentInnerDoorComponent = null;

      restoreGeneralPlanetState();
    };
  }

});
