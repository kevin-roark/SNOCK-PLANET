
var $ = require('jquery');
var kt = require('./lib/kutility');
var io = require('socket.io-client');

var Camera = require('./camera');
var config = require('./config');

$(function() {

  var state = {};
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

  // TODO: lights

  // create camera
  var cam = new Camera();
  var camera = cam.cam;

  // start doing things
  (function start() {
    render();

    $('body').keypress(function(ev) {
      console.log('key press eh? ' + ev.which);
      ev.preventDefault();

      keypress(ev.which);
    });
  })();

  // render every frame
  function render() {
    requestAnimationFrame(render);

    cam.render();

    renderer.render(scene, camera);
  }

  // interaction

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
