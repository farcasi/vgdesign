function rotateAroundWorldAxis(object, axis, radians) 
{
    var q = new THREE.Quaternion(); 
    q.setFromAxisAngle( axis, radians ); // axis must be normalized, angle in radians
    object.quaternion.premultiply( q );
}

function ballScript(mainBall)
{
	var velocity = mainBall.userData["velocity"];
    if (velocity === undefined) 
    {
        velocity = [0,0,0];
        mainBall.userData["velocity"] = velocity;
    }
    
    // Friction--slow down ball
    velocity[0] *= 0.98;
    velocity[1] *= 0.98;
    velocity[2] *= 0.98;
    
    handleCollisions(mainBall, getCollisions(mainBall))
    
    
    // Reduce "shivering" when on the ground
    if (mainBall.userData.isGrounded && Math.abs(velocity[1]) < 1) {
		velocity[1] = 0;
	}
	
	// Apply gravity if in the air
    if (mainBall.userData.isGrounded === false) {
		velocity[1] -= 1.5;
	}
	
	// Max out at terminal velocity
	if (Math.abs(velocity[1]) > constants.TERMINAL_VELOCITY) {
		velocity[1] = constants.TERMINAL_VELOCITY * Math.abs(velocity[1]) / velocity[1];
	}

	// Translate based on velocity
    mainBall.position.x += velocity[0] * engine.frameDuration;
    mainBall.position.y += velocity[1] * engine.frameDuration;
    mainBall.position.z += velocity[2] * engine.frameDuration;

	// Rotate based on actual translations
    // Separated axes isn't 100% accurate, but pretty close
    // if amounts are small
	var radius = mainBall.geometry.vertices[0].length();
    rotateAroundWorldAxis(mainBall, constants.ZAXIS, -velocity[0] * engine.frameDuration / radius);
    rotateAroundWorldAxis(mainBall, constants.XAXIS,  velocity[2] * engine.frameDuration / radius);
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
