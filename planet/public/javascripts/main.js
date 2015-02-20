
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
var keymaster = require('./keymaster');

// states
var BECOME_AVATAR_STATE = 0;
var GENERAL_PLANET_STATE = 1;
var INSIDE_DOOR_STATE = 2;

$(function() {

  var state = {
    frameCount: 0,
    state: BECOME_AVATAR_STATE,
    doors: [],
    avatars: {}
  };
  var socket = io(config.io_url);

  // create renderer
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer();
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
  startBecomeAvatarState();
  render();

  // render every frame
  function render() {
    requestAnimationFrame(render);

    state.frameCount += 1;

    // every 4 frames lets update our state to the server
    if (state.frameCount % 4 == 0) {
      socket.emit('avatar-update', {position: cam.controlPosition()});
    }

    cam.render();

    if (state.state == BECOME_AVATAR_STATE) {
      state.becomeAvatarComponent.render();
    }

    for (var i = 0; i < state.doors.length; i++) {
      state.doors[i].render();
    }

    renderer.render(scene, camera);
  }

  // io events

  socket.on('avatar-entry', function(avatarData) {
    var avatar = avatarWithName(avatarData.name);
    if (!avatar) {
      avatar = avatarTools.makeAvatarFromServer(avatarData);
      avatar.addTo(scene);
      state.avatars[avatar.name] = avatar;
    }

    avatar.wakeUp();
  });

  socket.on('avatar-move', function(avatarData) {
    var avatar = avatarWithName(avatarData.name);
    if (avatar) {
      avatar.moveTo(avatarData.position.x, avatarData.position.y, avatarData.position.z);
    }
  });

  socket.on('avatar-sleep', function(avatarData) {
    var avatar = avatarWithName(avatarData);
    if (avatar) {
      avatar.goSleep();
    }
  });

  socket.on('door-creation', function(doorData) {
    var door = doorTools.makeDoorFromServer(doorData);
    door.addTo(scene);
    state.doors.push(door);
  });

  // interaction

  function addGeneralInteractionListeners() {
    keymaster.setKeypressListener(113, true, function(ev) {
      console.log('toggle vantage point');
    });
  }

  // state transitions

  function startBecomeAvatarState() {
    state.becomeAvatarComponent = new BecomeAvatarComponent();
    state.becomeAvatarComponent.init(scene, socket);
    state.becomeAvatarComponent.finishedCallback = function() {
      startGeneralPlanetState();
    };
  }

  function startGeneralPlanetState() {
    cam.requestPointerLock();
    addGeneralInteractionListeners();
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

  function avatarWithName(name) {
    if (state.avatars[name]) {
      return state.avatars[name];
    }

    return null;
  }

});
