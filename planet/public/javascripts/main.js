
var $ = require('jquery');
var kt = require('./lib/kutility');
var io = require('socket.io-client');

var Camera = require('./camera');
var Avatar = require('./avatar');
var Door = require('./door');
var config = require('./config');

$(function() {

  var state = {frameCount: 0};
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

  if (config.testing) {
    var doorInFrontOfYou = new Door({
      position: {x: 0, y: 5, z: -15}
    });
    doorInFrontOfYou.addTo(scene);
  }

  // start rendering
  cam.active = true;
  cam.requestPointerLock();
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

    renderer.render(scene, camera);
  }

  // io events

  socket.on('avatar-entry', function(avatarData) {

  });

  socket.on('avatar-move', function(avatarData) {

  });

  socket.on('door-creation', function(doorData) {

  });

  // interaction

  $('body').keypress(function(ev) {
    console.log('key press eh? ' + ev.which);
    ev.preventDefault();

    keypress(ev.which);
  });

  function keypress(keycode) {
    switch (keycode) {
      case 32: // spacebar
        break;
      case 113: // q
        break;
    }
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
