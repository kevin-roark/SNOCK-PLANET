/**
 * BELOW CODE INSPIRED FROM
 * http://threejs.org/examples/misc_controls_pointerlock.html
 *
 * CHECK THE CODE FROM THIS LINK LATER CAUSE THERE IS SICK GENERATION STUFF
 */

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var $ = require('jquery');

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

var element = document.body;

var _camera, _renderer;
$(window).resize(function() {
  if (renderer) {
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  if (!_camera) {
    _camera.aspect = window.innerWidth / window.innerHeight;
    _camera.updateProjectionMatrix();
  }
});

module.exports = exports = Camera;

function Camera(scene, renderer, config) {
  this.cam = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 1, 3000);
  _camera = this.cam;
  _renderer = renderer;

  this.controls = new THREE.PointerLockControls(this.cam);
  scene.add(this.controls.getObject());

  this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

  // to check literal collisions quickly
  this.collidableMeshes = [];

  // to check for proximity with somewhat slow iteration
  this.proximableMeshes = [];
  this.proximityLimit = config.proximityLimit || 22500;

  this.active = false;
}

Camera.prototype.addCollidableMesh = function(mesh) {
  this.collidableMeshes.push(mesh);
}

Camera.prototype.addProximableMesh = function(mesh) {
  this.proximableMeshes.push(mesh);
}

Camera.prototype.render = function() {
  this.controls.isOnObject(false);

  var ob = this.controls.getObject();

  this.raycaster.ray.origin.copy(ob.position);
  this.raycaster.ray.origin.y -= 10;

  var intersections = this.raycaster.intersectObjects(this.collidableMeshes);
  if (intersections.length > 0) {
    this.controls.isOnObject(true);
  }
  if (this.collisionCallback) {
    this.collisionCallback(intersections);
  }

  if (this.proximityCallback) {
    var meshesWithinProximity = [];
    for (var i = 0; i < this.proximableMeshes.length; i++) {
      var mesh = this.proximableMeshes[i];

      if (!ob || !ob.position || !mesh || !mesh.position) continue;

      var xd = ob.position.x - mesh.position.x;
      xd *= xd;

      var zd = ob.position.z - mesh.position.z;
      zd *= zd;

      meshesWithinProximity.push(mesh);
    }

    this.proximityCallback(meshesWithinProximity);
  }

  this.controls.update();
}

Camera.prototype.isIdle = function() {
  return this.controls.isIdle();
}

Camera.prototype.controlPosition = function() {
  return this.controls.getObject().position;
}

Camera.prototype.pointerlockchange = function (event) {
  if (!this.active) return;

  if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
    this.controls.enabled = true;
  } else {
    this.controls.enabled = false;
  }
}

Camera.prototype.pointerlockerror = function (event) {
  console.log('POINTER LOCK ERROR');
}

Camera.prototype.requestPointerLock = function() {
  var self = this;

  if (havePointerLock) {
    // Hook pointer lock state change events
    document.addEventListener('pointerlockchange', function() {
      self.pointerlockchange();
    }, false);
    document.addEventListener('mozpointerlockchange', function() {
      self.pointerlockchange();
    }, false);
    document.addEventListener('webkitpointerlockchange', function() {
      self.pointerlockchange();
    }, false);

    document.addEventListener('pointerlockerror', function() {
      self.pointerlockerror();
    }, false);
    document.addEventListener('mozpointerlockerror', function() {
      self.pointerlockerror();
    }, false);
    document.addEventListener('webkitpointerlockerror', function() {
      self.pointerlockerror();
    }, false);

    document.addEventListener('click', function (event) {
      // Ask the browser to lock the pointer
      element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

      if (/Firefox/i.test( navigator.userAgent)) {

        var fullscreenchange = function ( event ) {
          if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
            document.removeEventListener( 'fullscreenchange', fullscreenchange );
            document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

            element.requestPointerLock();
          }
        }

        document.addEventListener('fullscreenchange', fullscreenchange, false);
        document.addEventListener('mozfullscreenchange', fullscreenchange, false);

        element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
        element.requestFullscreen();
      } else {
        element.requestPointerLock();
      }
    }, false);
  }
}
