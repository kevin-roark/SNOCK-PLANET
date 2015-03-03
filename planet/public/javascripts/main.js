
var $ = require('jquery');
var kt = require('./lib/kutility');
var io = require('socket.io-client');

var Camera = require('./camera');
var Avatar = require('./avatar');
var Door = require('./door');
var config = require('./config');
var globals = require('./global-state');
var doorTools = require('./door-tools');
var avatarTools = require('./avatar-tools');
var BecomeAvatarComponent = require('./become-avatar-component');
var GeneralPlanetComponent = require('./general-planet-component');
var keymaster = require('./keymaster');

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
  transitionToMode(BECOME_AVATAR_MODE);
  render();

  // render every frame
  function render() {
    requestAnimationFrame(render);

    state.frameCount += 1;

    // every 4 frames lets update our state to the server
    if (state.frameCount % 4 == 0 && globals.playerAvatar) {
      socket.emit('avatar-update', globals.playerAvatar.serialize());
    }

    cam.render();

    switch (state.mode) {
      case BECOME_AVATAR_MODE:
        state.becomeAvatarComponent.render();
        break;
      case GENERAL_PLANET_MODE:
        state.generalPlanetComponent.render();
        break;
    }

    renderer.render(scene, camera);
  }

  // state transitions

  function transitionToMode(mode) {
    state.mode = mode;

    switch (mode) {
      case BECOME_AVATAR_MODE:
        startBecomeAvatarState();
        break;
      case GENERAL_PLANET_MODE:
        startGeneralPlanetState();
        break;
      case INSIDE_DOOR_MODE:
        startInsideDoorState();
        break;
    }
  }

  function startBecomeAvatarState() {
    state.becomeAvatarComponent = new BecomeAvatarComponent();
    state.becomeAvatarComponent.init(scene, socket, cam);
    state.becomeAvatarComponent.finishedCallback = function() {
      transitionToMode(GENERAL_PLANET_MODE);
    };
  }

  function startGeneralPlanetState() {
    state.generalPlanetComponent = new GeneralPlanetComponent();
    state.generalPlanetComponent.init(scene, socket, cam);
    state.generalPlanetComponent.finishedCallback = function() {

    };
  }

  function startInsideDoorState() {

  }

  // utility

  function clearScene(meshes) {
    if (!meshes) meshes = scene.children;

    for (var i = meshes.length - 1; i >= 0; i--) {
      var obj = meshes[ i ];
      if (obj !== camera && obj !== mainLight) {
        scene.remove(obj);
      }
    }
  }

});
