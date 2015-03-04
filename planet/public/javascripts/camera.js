/**
 * BELOW CODE INSPIRED FROM
 * http://threejs.org/examples/misc_controls_pointerlock.html
 *
 * CHECK THE CODE FROM THIS LINK LATER CAUSE THERE IS SICK GENERATION STUFF
 */

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var $ = require('jquery');

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

var pointerlockElement = document.body;

var _camera, _renderer;

function resize() {
  if (_renderer) {
    _renderer.setSize(window.innerWidth, window.innerHeight);
  }

  if (_camera) {
    _camera.aspect = window.innerWidth / window.innerHeight;
    _camera.updateProjectionMatrix();
  }
}

$(window).resize(resize);

module.exports = exports = Camera;

function Camera(scene, renderer, config) {
  this.cam = new THREE.TargetCamera(65, window.innerWidth / window.innerHeight, 0.1, 3000);
  _camera = this.cam;
  _renderer = renderer;

  scene.add(this.cam);

  this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

  // to check literal collisions quickly
  this.collidableMeshes = [];

  // to check for proximity with somewhat slow iteration
  this.proximableMeshes = [];
  this.proximityLimit = config.proximityLimit || 22500;

  this.hasPointerlock = false;

  resize();
}

Camera.prototype.addCollidableMesh = function(mesh) {
  this.collidableMeshes.push(mesh);
};

Camera.prototype.addProximableMesh = function(mesh) {
  this.proximableMeshes.push(mesh);
};

Camera.prototype.render = function() {
  var ob = this.cam;

  this.raycaster.ray.origin.copy(ob.position);
  this.raycaster.ray.origin.y -= 10;

  var intersections = this.raycaster.intersectObjects(this.collidableMeshes);
  if (intersections.length > 0) {
    // got some intersections with collidable meshes
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

  if (this.cam.update) {
    this.cam.update();
  }
};

Camera.prototype.pointerlockchange = function () {
  if (document.pointerLockElement === pointerlockElement || document.mozPointerLockElement === pointerlockElement || document.webkitPointerLockElement === pointerlockElement ) {
    this.hasPointerlock = true;
  } else {
    this.hasPointerlock = false;
  }
};

Camera.prototype.pointerlockerror = function (event) {
  console.log('POINTER LOCK ERROR:');
  console.log(event);
};

Camera.prototype.requestPointerlock = function() {
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

    document.addEventListener('click', function() {
      // Ask the browser to lock the pointer
      pointerlockElement.requestPointerLock = pointerlockElement.requestPointerLock || pointerlockElement.mozRequestPointerLock || pointerlockElement.webkitRequestPointerLock;

      if (/Firefox/i.test( navigator.userAgent)) {

        var fullscreenchange = function() {
          if ( document.fullscreenElement === pointerlockElement || document.mozFullscreenElement === pointerlockElement || document.mozFullScreenElement === pointerlockElement ) {
            document.removeEventListener( 'fullscreenchange', fullscreenchange );
            document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

            pointerlockElement.requestPointerLock();
          }
        };

        document.addEventListener('fullscreenchange', fullscreenchange, false);
        document.addEventListener('mozfullscreenchange', fullscreenchange, false);

        pointerlockElement.requestFullscreen = pointerlockElement.requestFullscreen || pointerlockElement.mozRequestFullScreen || pointerlockElement.webkitRequestFullscreen;
        pointerlockElement.requestFullscreen();
      } else {
        pointerlockElement.requestPointerLock();
      }
    }, false);
  }
};
