//----------------------------------------------------------------------//
// CONTROL SCRIPTS
//----------------------------------------------------------------------//

/// sceneControl is called every frame.
/// Handles user input.
var sceneControl = function(sceneNode)
{
	var camera = gameState.camera;
	if (gameState.targetMode === undefined) {
		gameState.targetMode = true;
	}
	
	// display continuous debug info
	clearDebugInfo();
	addDebugInfo('camera position: '+camera.position.x+','+camera.position.y+','+camera.position.z);
	addDebugInfo('frame duration: '+engine.frameDuration);
	addDebugInfo('frames/second: '+(1/engine.frameDuration));
	var keyNames = [];
	for (var key in engine.pressedKeys) {
		if (engine.pressedKeys.hasOwnProperty(key)) {
			keyNames.push(key);
		}
	}
	addDebugInfo('pressed keys: ', keyNames);
	
	var player = gameState.scene.getObjectByName("playerBall");
	if (gameState.winCountdown === undefined) {
		gameState.winCountdown = 30;
	}
	if (gameState.wonGameFlag === undefined) {
		gameState.wonGameFlag = false;
	}
	if (gameState.wonGameFlag) {
		gameState.winCountdown--;
		if (gameState.winCountdown < 0) {
			// reset game
			player.position.set(0, -0.75, 0);
			var goalMesh = gameState.scene.getObjectByName("goal", true);
			goalMesh.material.color.set(0x00b300);
			gameState.winCountdown = 30;
			gameState.wonGameFlag = false;
			resetCamera();
			return;
		}
	}
	
	var scene = gameState.scene;
	
    if (engine.pressedKeys[constants.W])
    {
        translateCamera(new THREE.Vector3(0,1,0));
    }
    if (engine.pressedKeys[constants.A])
    {
        translateCamera(new THREE.Vector3(-1,0,0));
    }
    if (engine.pressedKeys[constants.S])
    {
        translateCamera(new THREE.Vector3(0,-1,0));
    }
    if (engine.pressedKeys[constants.D])
    {
        translateCamera(new THREE.Vector3(1,0,0));
    }
    if (engine.pressedKeys[constants.E])
    {
        translateCamera(new THREE.Vector3(0,0,1));
    }
    if (engine.pressedKeys[constants.Q])
    {
        translateCamera(new THREE.Vector3(0,0,-1));
    }
    if (engine.pressedKeys[constants.NUMPAD_5])
    {
		gameState.targetMode = true;
        resetCamera();
    }
    
    // if player goes below "death plane", touches skybox, or presses R, they lose and restart
	if (player.position.y < -100 || 
		gameState.objectsPlayerCollidedWith.has("skybox") || 
		engine.pressedKeys[constants.R]) { 
		// reset game
		player.position.set(0, 0, 0);
		player.userData.velocity = [0, 0, 0];
		var goalMesh = gameState.scene.getObjectByName("goal", true);
		goalMesh.material.color.set(0x00b300);
	}
	
	// if player touches 'goal', they win
	if (gameState.objectsPlayerCollidedWith.has('goal')) {
		player.userData.velocity = [0, 0, 0];
		gameState.wonGameFlag = true;
		
		// tell the player they won
		// get goal ground and change texture
		var goalMesh = gameState.scene.getObjectByName("goal", true);
		goalMesh.material.color.set(0xffffff);
	}
}

function rotateAroundWorldAxis(object, axis, radians) 
{
    var q = new THREE.Quaternion(); 
    q.setFromAxisAngle( axis, radians ); // axis must be normalized, angle in radians
    object.quaternion.premultiply( q );
}

function ballScript(playerBall)
{
	addDebugInfo('player position: '+playerBall.position.x+','+playerBall.position.y+','+playerBall.position.z);
	addDebugInfo('player velocity: '+playerBall.userData.velocity[0]+','+playerBall.userData.velocity[1]+','+playerBall.userData.velocity[2]);
	addDebugInfo('player rotation: '+playerBall.rotation.x+','+playerBall.rotation.y+','+playerBall.rotation.z);
	addDebugInfo('player grounded: '+playerBall.userData.isGrounded);
	addDebugInfo('colliding objects: ', gameState.objectsPlayerCollidedWith);
    
    handleKeyPresses(playerBall);
    if (!gameState.wonGameFlag) {
		handlePhysics(playerBall);
	}
	
	// Translate camera based on player position
	resetCamera(playerBall);
}

function handleKeyPresses(playerBall) 
{
	var accel = 30.0;
    var rotation = 0.05;
	if (engine.pressedKeys[constants.LEFT_ARROW])
    {
		gameState.targetMode = true;
		playerBall.userData.velocity[0] -= accel * engine.frameDuration;
		rotateAroundWorldAxis(playerBall, constants.ZAXIS, rotation);
    }
    if (engine.pressedKeys[constants.RIGHT_ARROW])
    {
		gameState.targetMode = true;
		playerBall.userData.velocity[0] += accel * engine.frameDuration;
		rotateAroundWorldAxis(playerBall, constants.ZAXIS, -rotation);
    }
    if (engine.pressedKeys[constants.UP_ARROW])
    {
		gameState.targetMode = true;
		playerBall.userData.velocity[2] -= accel * engine.frameDuration;
		rotateAroundWorldAxis(playerBall, constants.XAXIS, -rotation);
    }
    if (engine.pressedKeys[constants.DOWN_ARROW])
    {
		gameState.targetMode = true;
        playerBall.userData.velocity[2] += accel * engine.frameDuration;
		rotateAroundWorldAxis(playerBall, constants.XAXIS, rotation);
    }
    if (engine.pressedKeys[80]) // P
    {
        playerBall.userData.velocity = [0,0,0];
    }
}

function handlePhysics(player)
{
	var velocity = player.userData.velocity;
    if (velocity === undefined) 
    {
        velocity = [0,0,0];
        player.userData.velocity = velocity;
    }
    
    // Friction--slow down ball
    velocity[0] *= 0.98;
    velocity[1] *= 0.98;
    velocity[2] *= 0.98;
    
    handleCollisions(player, getCollisions(player))
    
    // Reduce "shivering" when on the ground
    if (player.userData.isGrounded && Math.abs(velocity[1]) < 1) {
		velocity[1] = 0;
	}
	
	// Apply gravity if in the air
    if (player.userData.isGrounded === false) {
		velocity[1] -= 1.5;
	}
	
	// Max out at terminal velocity
	if (Math.abs(velocity[1]) > constants.TERMINAL_VELOCITY) {
		velocity[1] = constants.TERMINAL_VELOCITY * Math.abs(velocity[1]) / velocity[1];
	}

	// Translate based on velocity
    player.position.x += velocity[0] * engine.frameDuration;
    player.position.y += velocity[1] * engine.frameDuration;
    player.position.z += velocity[2] * engine.frameDuration;

	// Rotate based on actual translations
    // Separated axes isn't 100% accurate, but pretty close
    // if amounts are small
	var radius = player.geometry.vertices[0].length();
    rotateAroundWorldAxis(player, constants.ZAXIS, -velocity[0] * engine.frameDuration / radius);
    rotateAroundWorldAxis(player, constants.XAXIS,  velocity[2] * engine.frameDuration / radius);
}

/// Handles player collisions.
/// When player collides with something, 
/// player should move and the object should not
function handleCollisions(player, collidedObjects) 
{
	var velocity = player.userData["velocity"];
	var m1 = player.userData["mass"];
	gameState.objectsPlayerCollidedWith.clear();
	player.userData.isGrounded = false;
	
	collidedObjects.forEach( function(other) {
		// a collision occured
		var otherObject = other.object;
		if (otherObject.geometry === undefined) 
		{
			// other isn't a mesh
			return;
		}
		if (otherObject.userData === undefined)
		{
			otherObject.userData = {
				"velocity": [0,0,0],
				"mass": 5,
			};
		}
		
		// the next line is for debug mode
		gameState.objectsPlayerCollidedWith.add(otherObject.name);
		
		// compute other object velocity and mass
		var otherVelocity = otherObject.userData["velocity"];
		if (otherVelocity === undefined)
		{
			otherVelocity = [0,0,0];
			otherObject.userData["velocity"] = otherVelocity;
		}
		
		var m2 = otherObject.userData["mass"];
		if (m2 === undefined)
		{
			m2 = 5;
			otherObject.userData["mass"] = m2;
		}
		
		var centerDifference = new THREE.Vector3();
		if (otherObject.geometry.type === 'PlaneBufferGeometry') {
			// other object is 'ground', only get y-difference
			centerDifference.y = otherObject.position.y - player.position.y;
			centerDifference.normalize();
		} else 
		{
			//other object is not ground (sphere atm), so get vector difference
			centerDifference = otherObject.position.clone().sub(player.position).normalize();
		}
		
		var Vrel = new THREE.Vector3(
			otherVelocity[0]-velocity[0], 
			otherVelocity[1]-velocity[1], 
			otherVelocity[2]-velocity[2]
		);
		
		// compute repulsion force from other object
		var repulsionForce = 0.0;
		if (Vrel.dot(centerDifference) < 0)
		{
			repulsionForce = (-2.0 * Vrel.dot(centerDifference)) / (1.0/m1 + 1.0/m2);
		}

		repulsionForce += 0.1;
		if (otherObject.geometry.type === 'PlaneBufferGeometry') {
			// hitting ground, don't change horizontal momentum
			velocity[1] -= repulsionForce * centerDifference.y / m1;
			player.userData.isGrounded = true;
		} else 
		{
			velocity[0] -= repulsionForce * centerDifference.x / m1;
			velocity[1] -= repulsionForce * centerDifference.y / m1;
			velocity[2] -= repulsionForce * centerDifference.z / m1;
		}
	});
}

function getVectorString(v) {
	return v.x+","+v.y+","+v.z;
}

//----------------------------------------------------------------------//
// CAMERA FUNCTIONS
//----------------------------------------------------------------------//

/// Translate the camera
function translateCamera(vector)
{
	var eye = gameState.camera.position;
	gameState.camera.position.set(eye.x + vector.x, eye.y + vector.y, eye.z + vector.z);
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
