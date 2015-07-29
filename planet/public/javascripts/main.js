
var $ = require('jquery');
var io = require('socket.io-client');
var kt = require('./lib/kutility');
require('./lib/rainbow')($);

var Camera = require('./camera');
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

  // trying to keep most mutable state in here
  var state = {
    frameCount: 0,
    mode: BECOME_AVATAR_MODE
  };

  // set up my ole socket.IO listeners
  var socket = io(window.serverConfig.ioURL);
  socket.on('avatar-updates', function(avatarUpdates) {
    updateCohabitantCount(avatarUpdates.awakeCount);

    var planetComponent = state.generalPlanetComponent;
    var doorComponent = state.currentInnerDoorComponent;
    var updatedAvatars = avatarUpdates.avatars;

    for (var i = 0; i < updatedAvatars.length; i++) {
      var avatarData = updatedAvatars[i];

      if (!avatarData.currentDoor) {
        // its in the planet
        if (planetComponent) {
          // update the sucker
          planetComponent.avatarUpdate(avatarData);
        }

        if (doorComponent && doorComponent.containsAvatar(avatarData)) {
          doorComponent.removeAvatar(avatarData);
        }
      }
      else {
        // its in a door
        if (doorComponent && doorComponent.door._id === avatarData.currentDoor) {
          // its in my curent door
          doorComponent.avatarUpdate(avatarData);
        }

        if (planetComponent && planetComponent.containsAvatar(avatarData)) {
          // it used to be in planet .. cleanse it
          planetComponent.removeAvatar(avatarData);
        }
      }
    }
  });

  // anything in the DOM declared here
  var $huds = $('.bottom-hud, .top-hud');
  var $worldCoordinates = $('.world-coordinates');
  var $currentSpace = $('.current-space');
  var $questionMark = $('.question-mark');
  var $faq = $('.faq');
  var $avatarCount = $('.avatar-count');
  var $instructionsBanner = $('.instructions-banner');
  var $tryChromeBanner = $('.try-chrome-banner');
  var backgroundMusic = document.querySelector('#background-music');
  backgroundMusic.onended = function() {
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
  };

  // create THREE.JS renderer
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

  // create THREE.JS scene
  var scene = new THREE.Scene();

  // TODO: fog

  // soft white light
  var ambientLight = new THREE.AmbientLight( 0x404040 );
  scene.add(ambientLight);

  // create camera
  var cam = new Camera(scene, renderer, {forbiddenRequestClasses: ['question-mark', 'faq']});
  var camera = cam.cam;

  // set up globals
  globals.io = socket;
  globals.renderer = renderer;
  globals.scene = scene;
  globals.camera = cam;

  // start rendering
  cam.active = true;
  startBecomeAvatarState();
  render();

  // react to  global DOM shit
  var showingFAQ = false;
  $questionMark.click(function() {
    toggleFaq();
  });
  $('canvas, .avatar-ui-wrapper, .door-ui-wrapper, .message-ui-wrapper').click(function() {
    if (showingFAQ) {
      toggleFaq();
    }
  });
  function toggleFaq() {
    if (!showingFAQ) {
      $faq.show();
    }
    else {
      $faq.hide();
    }

    showingFAQ = !showingFAQ;
  }

  // render every frame
  function render() {
    requestAnimationFrame(render);

    state.frameCount += 1;

    // every few frames lets update our state to the server
    if (state.frameCount % 60 === 0 && state.mode !== BECOME_AVATAR_MODE) {
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

    if (state.mode !== BECOME_AVATAR_MODE) {
      var coordinates = globals.playerAvatar.positionAsCoordinates();
      $worldCoordinates.text('(' + coordinates + ')');
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
      if (state.mode === INSIDE_DOOR_MODE && state.generalPlanetComponent.savedPosition) {
        avatar.moveTo(state.generalPlanetComponent.savedPosition);
      }

      avatar.goSleep();
      updateMyAvatar();
    }
  };

  // state transitions

  function startBecomeAvatarState() {
    state.becomeAvatarComponent = new BecomeAvatarComponent();
    state.becomeAvatarComponent.init(scene, socket, cam);
    state.becomeAvatarComponent.finishedCallback = function() {
      $huds.fadeIn();
      startGeneralPlanetState();
    };
  }

  function startGeneralPlanetState() {
    state.mode = GENERAL_PLANET_MODE;

    state.generalPlanetComponent = new GeneralPlanetComponent();
    state.generalPlanetComponent.init(scene, socket, cam);

    setGeneralPlanetHud();

    var bannerInterval = setInterval(function() {
      $instructionsBanner.toggle();
    }, 500);
    setTimeout(function() {
      $instructionsBanner.hide();
      clearInterval(bannerInterval);
    }, 8000);

    if (!window.chrome) {
      var chromeFlashInterval = setInterval(function() {
        $tryChromeBanner.toggle();
      }, 500);
      setTimeout(function() {
        clearInterval(chromeFlashInterval);
        $tryChromeBanner.hide();
      }, 10000);
    }

    backgroundMusic.volume = 0.25;

    state.generalPlanetComponent.enterDoorCallback = function(door) {
      state.generalPlanetComponent.markFinished();

      startInsideDoorState(door);
    };
  }

  function restoreGeneralPlanetState() {
    state.mode = GENERAL_PLANET_MODE;
    state.generalPlanetComponent.restore();
    setGeneralPlanetHud();
  }

  function setGeneralPlanetHud() {
    setCurrentSpaceText('SNOCK PLANET');
    setCurrentInstructions('arrows: move. mouse: camera. "Q": toggle view. space: enter a room. "N": create a room.');
  }

  function startInsideDoorState(door) {
    if (state.mode === INSIDE_DOOR_MODE) {
      return; // already inside a door brother...
    }

    state.mode = INSIDE_DOOR_MODE;

    setCurrentSpaceText(door.subject.toUpperCase());
    setCurrentInstructions('arrows: move. mouse: camera. "Q": toggle view. "Z": exit room. "N": leave a message.');

    state.currentInnerDoorComponent = new InnerDoorComponent();
    state.currentInnerDoorComponent.init(scene, socket, cam, {door: door});
    state.currentInnerDoorComponent.finishedCallback = function() {
      state.currentInnerDoorComponent.removeObjects();
      state.currentInnerDoorComponent = null;

      restoreGeneralPlanetState();
    };
  }

  function updateCohabitantCount(count) {
    var number = parseInt(count);
    if (number !== undefined) {
      var numberMinusSelf = Math.max(number - 1, 0);
      var others = numberMinusSelf === 1 ? 'other' : 'others';
      $avatarCount.text(numberMinusSelf + ' living ' + others);
    }
  }

  function setCurrentInstructions(text) {
    $('.current-instructions').text(text);
  }

  function setCurrentSpaceText(text) {
    var currentSpaceColors = [
      'rgb(50, 221, 103)',
      'rgb(50, 124, 221)',
      'rgb(110, 50, 221)',
      'rgb(221, 50, 147)',
      'rgb(221, 112, 50)',
      'rgb(221, 214, 50)'
    ];
    $currentSpace.css('color', kt.choice(currentSpaceColors));

    $currentSpace.text(text);
  }

});
