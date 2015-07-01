/**
 * THREE.TargetCamera 0.1.0
 * (c) 2013 Luke Moody (http://www.github.com/squarefeet)
 *
 * Modified by Kevin Roark (github.com/kevin-roark) for my purposes.
 *
 * THREE.TargetCamera may be freely distributed under the MIT license
 *  (See the LICENSE file at root of this repository.)
 */

THREE.TargetCamera = function(fov, aspect, near, far) {

    // super constructor
    THREE.PerspectiveCamera.call(this);

    //
    this.targets = {};
    this.currentTargetName = null;

    // A helper Object3D. Used to help position the camera based on the
    // two position settings above.
    this._idealObject = new THREE.Object3D();

    this._isTransitioning = false;

    // Default target settings.
    this._defaults = {
        name: null,
        targetObject: new THREE.Object3D(),
        cameraPosition: new THREE.Vector3(0, 30, 50),
        cameraRotation: undefined,
        fixed: false,
        stiffness: 0.4,
        matchRotation: true
    };
};

THREE.TargetCamera.prototype = Object.create( THREE.PerspectiveCamera.prototype );
THREE.TargetCamera.prototype.constructor = THREE.TargetCamera;

THREE.TargetCamera.prototype._translateIdealObject = function( vec ) {
    var obj = this._idealObject;

    if( vec.x !== 0 ) {
        obj.translateX( vec.x );
    }

    if( vec.y !== 0 ) {
        obj.translateY( vec.y );
    }

    if( vec.z !== 0 ) {
        obj.translateZ( vec.z );
    }
};

THREE.TargetCamera.prototype._createNewTarget = function() {
    var defaults = this._defaults;

    return {
        name: defaults.name,
        targetObject: defaults.targetObject,
        cameraPosition: defaults.cameraPosition,
        cameraRotation: defaults.cameraRotation,
        fixed: defaults.fixed,
        stiffness: defaults.stiffness,
        matchRotation: defaults.matchRotation
    };
};

THREE.TargetCamera.prototype._determineCameraRotation = function( rotation ) {
    if( rotation instanceof THREE.Euler ) {
        return new THREE.Quaternion().setFromEuler( rotation );
    }
    else if( rotation instanceof THREE.Quaternion ) {
        return rotation;
    }
    else {
        return undefined;
    }
};

THREE.TargetCamera.prototype.addTarget = function( settings ) {
    var target = this._createNewTarget();

    if( typeof settings === 'object' ) {
        for( var i in settings ) {
            if( target.hasOwnProperty( i ) ) {
                if( i === 'cameraRotation' ) {
                    target[ i ] = this._determineCameraRotation( settings[ i ] );
                }
                else {
                    target[ i ] = settings[ i ];
                }
            }
        }
    }

    this.targets[ settings.name ] = target;
};

THREE.TargetCamera.prototype.removeTarget = function(name) {
  if (name && this.targets[name]) {
      delete this.targets[name];
  }

  if (this.currentTargetName == name) {
    this.currentTargetName = null;
  }
};

THREE.TargetCamera.prototype.setTarget = function( name ) {
    if( this.targets.hasOwnProperty( name ) ) {
        this.currentTargetName = name;
    }
    else {
        console.warn( 'THREE.TargetCamera.setTarget: No target with name ' + name );
    }
};

THREE.TargetCamera.prototype.update = function( dt ) {
    var target = this.targets[ this.currentTargetName ],
        ideal = this._idealObject;

    if( !target ) return;

    var targetPosition = new THREE.Vector3();
    var targetQuaternion = new THREE.Quaternion();
    var targetScale = new THREE.Vector3();
    target.targetObject.matrixWorld.decompose( targetPosition, targetQuaternion, targetScale );

    if( !target.fixed ) {
        ideal.position.copy( targetPosition );
        ideal.quaternion.copy( targetQuaternion );

        if( target.cameraRotation !== undefined ) {
            ideal.quaternion.multiply( target.cameraRotation );
        }

        this._translateIdealObject( target.cameraPosition );
        this.position.lerp( ideal.position, target.stiffness );

        if( target.matchRotation ) {
            this.quaternion.slerp( ideal.quaternion, target.stiffness );
        }
        else {
            this.lookAt( targetPosition );
        }
    }
    else {
        this.position.copy( target.cameraPosition );
        this.lookAt( targetPosition);
    }
};
