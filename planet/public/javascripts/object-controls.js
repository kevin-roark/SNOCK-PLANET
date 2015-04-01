
/**
 * Originally written by squarefeet (github.com/squarefeet).
 * Modified by Kevin Roark (github.com/kevin-roark) for own purposes.
 */
module.exports = function ObjectControls( opts ) {
    var options = {
        mousePos: null,
        target: null,

        invertX: true,
        invertZ: true,

        positionVelocityIncrement: 2,
        positionVelocityDecrement: 0.95,
        maxPositionVelocity: 40,

        rotationDamping: {x: 100, y: 500},
        rotationLimit: {y: {min: -Math.PI/12, max: Math.PI/12}},

        rollVelocityIncrement: 0.05,
        rollVelocityDecrement: 0.95,
        maxRollVelocity: 2
    };

    if (!opts) opts = {};
    for(var i in opts) {
      if (opts.hasOwnProperty(i)) {
        options[i] = opts[i];
      }
    }

    this.mousePos = options.mousePos || new THREE.Vector2();

    var PI_2 = Math.PI / 2,
        forward = false,
        back = false,
        left = false,
        right = false,
        rollLeft = false,
        rollRight = false,
        rollRotation = 0,
        positionVector = new THREE.Vector3(),
        cameraQuaternion = new THREE.Quaternion();

    var pitchObject = new THREE.Object3D();
    var yawObject = new THREE.Object3D();
    yawObject.add(pitchObject);

    var updateRolling = function(dt) {
      var inc = options.rollVelocityIncrement,
          dec = options.rollVelocityDecrement,
          max = options.maxRollVelocity;

      if (rollLeft) {
          rollRotation += inc;
      }
      else if (rollRight) {
          rollRotation -= inc;
      }
      else {
          rollRotation *= dec;
      }

      if (rollRotation > max) {
        rollRotation = max;
      }
      else if (rollRotation < -max) {
        rollRotation = -max;
      }
    };

    var updatePosition = function(dt) {
        var inc = options.positionVelocityIncrement,
            dec = options.positionVelocityDecrement,
            max = options.maxPositionVelocity;

        if( forward ) {
            positionVector.z -= (options.invertZ? -inc : inc);;
        }
        else if( back ) {
            positionVector.z += (options.invertZ? -inc : inc);;
        }
        else {
            positionVector.z *= dec;
        }

        if( left ) {
            positionVector.x -= (options.invertX? -inc : inc);
        }
        else if( right ) {
            positionVector.x += (options.invertX? -inc : inc);
        }
        else {
            positionVector.x *= dec;
        }


        if( positionVector.z > max ) {
            positionVector.z = max;
        }
        else if( positionVector.z < -max ) {
            positionVector.z = -max;
        }

        if( positionVector.x > max ) {
            positionVector.x = max;
        }
        else if( positionVector.x < -max ) {
            positionVector.x = -max;
        }

        positionVector.y *= dec;
    };

    var updateCameras = function(dt) {
        var velX = positionVector.x * dt,
            velY = positionVector.y * dt,
            velZ = positionVector.z * dt,
            roll = rollRotation * dt;

        var targetMeshes;
        if (options.target && options.target.meshes) {
          targetMeshes = options.target.meshes;
        } else if (options.target) {
          targetMeshes = [options.target];
        } else {
          targetMeshes = [];
        }

        for (var i = 0; i < targetMeshes.length; i++) {
          var obj = targetMeshes[i];

          if (obj) {
            obj.rotation.set(pitchObject.getWorldQuaternion().x, yawObject.rotation.y, 0);

            obj.translateX( velX );
            obj.translateY( velY );
            obj.translateZ( velZ );
          }
        }
    };


    this.update = function( dt ) {
      updateRolling(dt);
      updatePosition(dt);
      updateCameras(dt);
    };

    this.mouseUpdate = function(movementX, movementY) {
      yawObject.rotation.y -= movementX / options.rotationDamping.x;

      var x = pitchObject.rotation.x - movementY / options.rotationDamping.y;
      if (x < options.rotationLimit.y.min) {
        x = options.rotationLimit.y.min;
      } else if (x > options.rotationLimit.y.max) {
        x = options.rotationLimit.y.max;
      }
      pitchObject.rotation.x = x;
    };


    this.setForward = function( state ) {
        forward = state;
    };
    this.setBackward = function( state ) {
        back = state;
    };
    this.setLeft = function( state ) {
        left = state;
    };
    this.setRight = function( state ) {
        right = state;
    };

    this.setRollLeft = function( state ) {
        rollLeft = state;
    };
    this.setRollRight = function( state ) {
        rollRight = state;
    };


    this.getCameraRotation = function() {
        return cameraQuaternion;
    };

    this.getVelocity = function() {
        return positionVector;
    };

    this.getForwardSpeedAsPercentage = function() {
        return positionVector.z / options.maxPositionVelocity;
    };

    this.getAbsoluteForwardSpeedAsPercentage = function() {
        return Math.abs(positionVector.z) / options.maxPositionVelocity;
    };

    this.isIdle = function() {
      return !(forward || back || left || right);
    };
};
