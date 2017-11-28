//----------------------------------------------------------------------//
// GAME-SPECIFIC CONSTANTS
//----------------------------------------------------------------------//

gameState.moveCamera = null;
gameState.cameraSensitivity = 4;
var speed = 900;
var jumpSpeed = 90;
var mass = 20;
var cameraLookVector = new THREE.Vector3();
var canJump = false;
var raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
addDebugInfo("canJump:", canJump);

//----------------------------------------------------------------------//
// CONTROL SCRIPTS 
//----------------------------------------------------------------------//

/// sceneControl is called every frame.
var sceneControl = function(sceneNode)
{
	var camera = gameState.camera;
	if (gameState.targetMode === undefined) {
		gameState.targetMode = true;
	}
	//if (gameState.moveCamera != null) {
		//// make camera follow mouse
		
		//var camUp = new THREE.Vector3(0, 1, 0).applyQuaternion( camera.quaternion );
		//var sideAxis = getForwardDirection().normalize().cross( camUp );
		//rotateAroundWorldAxis(gameState.camera, sideAxis, -1 * gameState.moveCamera.y);
		//rotateAroundWorldAxis(gameState.camera, constants.YAXIS, -1 * gameState.moveCamera.x);
		
		//gameState.moveCamera = null;
	//}
	
	// display continuous debug info
	clearDebugInfo();
	addDebugInfo('canvas focus: '+(document.activeElement.id == engine.CANVAS_ID));
	addDebugInfo('camera position: '+camera.position.x+','+camera.position.y+','+camera.position.z);
	addDebugInfo('frame duration: '+engine.frameDuration);
	addDebugInfo('frames/second: '+(1/engine.frameDuration));
	addDebugInfo('PrevMouse: ['+engine.mousePrevX+","+engine.mousePrevY+"]");
	addDebugInfo('Mouse:     ['+engine.mouseX+","+engine.mouseY+"]");
	var keyNames = [];
	for (var key in engine.pressedKeys) {
		if (engine.pressedKeys.hasOwnProperty(key)) {
			keyNames.push(key);
		}
	}
	addDebugInfo('pressed keys: ', keyNames);
	
	handleKeyPresses();
}

function rotateAroundWorldAxis(object, axis, radians) 
{
    var q = new THREE.Quaternion(); 
    q.setFromAxisAngle( axis, radians ); // axis must be normalized, angle in radians
    object.quaternion.premultiply( q );
}

/// Source:	https://threejs.org/examples/misc_controls_pointerlock.html
function handleKeyPresses() 
{
	if ( gameState.controlsEnabled === true ) {
		raycaster.ray.origin.copy( gameState.controls.getObject().position );
		raycaster.ray.origin.y -= 10;

		var intersections = raycaster.intersectObjects( gameState.scene.children );

		var onObject = intersections.length > 0;

		var delta = engine.frameDuration;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * mass * delta;

		var moveForward = engine.pressedKeys[constants.W] ? 1 : 0;
		var moveBackward = engine.pressedKeys[constants.S] ? 1 : 0;
		var moveLeft = engine.pressedKeys[constants.A] ? 1 : 0;
		var moveRight = engine.pressedKeys[constants.D] ? 1 : 0;
		
		direction.z = moveForward - moveBackward;
		direction.x = moveLeft - moveRight;
		direction.normalize(); // this ensures consistent movements in all directions
		
		if ( moveForward || moveBackward ) velocity.z -= direction.z * speed * delta;
		if ( moveLeft || moveRight ) velocity.x -= direction.x * speed * delta;

		if ( onObject === true ) {
			velocity.y = Math.max( 0, velocity.y );
			canJump = true;
		}
		
		var jump = engine.pressedKeys[constants.SPACE_BAR];
		if (canJump === true && jump) {
			velocity.y += jumpSpeed;
			canJump = false;
		}

		gameState.controls.getObject().translateX( velocity.x * delta );
		gameState.controls.getObject().translateY( velocity.y * delta );
		gameState.controls.getObject().translateZ( velocity.z * delta );

		if ( gameState.controls.getObject().position.y < 10 ) {
			velocity.y = 0;
			gameState.controls.getObject().position.y = 10;

			canJump = true;
		}
	}
	
    if (engine.pressedKeys[constants.E])
    {
        translateCamera(new THREE.Vector3(0,1,0));
    }
    if (engine.pressedKeys[constants.Q])
    {
        translateCamera(new THREE.Vector3(0,-1,0));
    }
    if (engine.pressedKeys[constants.NUMPAD_5])
    {
		gameState.targetMode = true;
        resetCamera();
    }
}

/// Move camera with mouse
/// Source: https://stackoverflow.com/questions/8426822/rotate-camera-in-three-js-with-mouse
var mouseMoveHandler = function(event)
{
	event.preventDefault();
	
	var xRot = (engine.mouseX - engine.mousePrevX)
		* Math.PI / 180 * gameState.cameraSensitivity / 20;
		
	var yRot = (engine.mouseY - engine.mousePrevY)
		* Math.PI / 180 * gameState.cameraSensitivity / 20;

    gameState.moveCamera = new THREE.Vector3(xRot, yRot, 0);
}

//----------------------------------------------------------------------//
// CAMERA FUNCTIONS
//----------------------------------------------------------------------//

/// Translate the camera
function translateCamera(vector)
{
	gameState.camera.position.add(vector);
	gameState.targetMode = false;
}

/// Overriding the gameEngine's resetCamera method to focus on behindObject
function resetCamera(behindObject)
{
	var origin = gameState.original.camera;
	if (gameState.targetMode === false) {
		return;
	}
		
	if (behindObject === undefined) {
		var eye = origin.eye;
		gameState.camera.position.set( eye[0], eye[1], eye[2] );
		
		var center = origin.center;
		gameState.camera.lookAt( new THREE.Vector3(center[0], center[1], center[2]) );
	} else {
		var eye = origin.eye;
		gameState.camera.position.set( 
			behindObject.position.x + eye[0], 
			behindObject.position.y + eye[1], 
			behindObject.position.z + eye[2] );
		
		gameState.camera.lookAt( behindObject.position );
	}
	
	var vup = origin.vup;
	gameState.camera.up.set( vup[0], vup[1], vup[2] );
}


//------------------------------------------------------------------//
// CANVAS FOCUS
//------------------------------------------------------------------//

//gameState.gotFocus = function(event) 
//{
	//document.getElementById(engine.CANVAS_ID).style.cursor = 'none';
//}

//gameState.lostFocus = function(event) 
//{
	//document.getElementById(engine.CANVAS_ID).style.cursor = 'default';
//}
