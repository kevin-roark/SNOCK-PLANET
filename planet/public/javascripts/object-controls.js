
/**
 * Originally written by squarefeet (github.com/squarefeet).
 * Modified by Kevin Roark (github.com/kevin-roark) for own purposes.
 */
module.exports = function ObjectControls( opts ) {
    var options = {
        mousePos: null,
        target: null,
        positionVelocityIncrement: 5,
        positionVelocityDecrement: 0.95,
        invertX: true,
        invertZ: true,

        rotationDamping: 20,

        rollVelocityIncrement: 0.05,
        rollVelocityDecrement: 0.95,

        maxPositionVelocity: 200,
        maxRotationVelocity: 10,
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
        rotationQuaternion = new THREE.Quaternion(),
        positionVector = new THREE.Vector3(),
        cameraQuaternion = new THREE.Quaternion();

    var pitchVector = new THREE.Object3D();
    var yawVector = new THREE.Object3D();
    yawVector.add(pitchVector);

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

    var updateRotation = function(dt) {
        //rotationVector.y = -self.mousePos.x / options.rotationDamping;
        //rotationVector.x = -self.mousePos.y / options.rotationDamping;
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

        rotationQuaternion.set(
            yawVector.rotation.x * dt,
            -yawVector.rotation.y * dt,
            roll,
            1
        ).normalize();

        var targetMeshes;
        if (options.target.meshes) {
          targetMeshes = options.target.meshes();
        } else if (options.target) {
          targetMeshes = options.target;
        } else {
          targetMeshes = [];
        }

        for (var i = 0; i < targetMeshes.length; i++) {
          var obj = targetMeshes[i];

          //obj.quaternion.multiply( rotationQuaternion );
          obj.rotation.copy(yawVector.rotation);

          obj.translateX( velX );
          obj.translateY( velY );
          obj.translateZ( velZ );
        }
    };


    this.update = function( dt ) {
      updateRolling(dt);
      updateRotation(dt);
      updatePosition(dt);
      updateCameras(dt);
    };

    this.mouseUpdate = function(movementX, movementY) {
      yawVector.rotation.y += movementX / options.rotationDamping;

      pitchVector.rotation.x += movementY / options.rotationDamping;
      pitchVector.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchVector.rotation.x));
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
