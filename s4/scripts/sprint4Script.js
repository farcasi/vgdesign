//----------------------------------------------------------------------//
// GAME-SPECIFIC CONSTANTS
//----------------------------------------------------------------------//

constants.speedThreshold = 0.1;
gameState.onTrack = true;
gameState.accel = 30.0;
gameState.brake = 60.0;
gameState.maxSpeed = 60.0;
gameState.speed = 0.0;
gameState.rSpeed = 0.2;

//----------------------------------------------------------------------//
// CONTROL SCRIPTS 
//----------------------------------------------------------------------//

/// sceneControl is called every frame.
function sceneControl(sceneNode)
{
	// display continuous debug info
	if (engine.DEBUG) {
		var camera = gameState.camera;
		var car = gameState.scene.getObjectByName('car');
		
		clearDebugInfo();
		addDebugInfo('Active element: '+document.activeElement.id);
		addDebugInfo('Current scene: '+gameState.scene.name);
		addDebugInfo('Camera position: '+camera.position.x+','+camera.position.y+','+camera.position.z);
		addDebugInfo('Framerate: '+(1/engine.frameDuration));
		addDebugInfo('Car position: '+car.position.x+','+car.position.y+','+car.position.z);
		addDebugInfo('Speed: '+gameState.speed);
		var keyNames = [];
		for (var key in engine.pressedKeys) {
			if (engine.pressedKeys.hasOwnProperty(key)) {
				keyNames.push(key);
			}
		}
		addDebugInfo('Pressed keys: ', keyNames);
	}
	
	handleKeyPresses();
}

/// Source:	https://threejs.org/examples/misc_controls_pointerlock.html
function handleKeyPresses() 
{
	if (engine.pressedKeys[constants.KEYBOARD_1] || 
		engine.pressedKeys[constants.NUMPAD_1])
    {
        switchCamera(0);
    }
	if (engine.pressedKeys[constants.KEYBOARD_2] || 
		engine.pressedKeys[constants.NUMPAD_2])
    {
        switchCamera(1);
    }
	if (engine.pressedKeys[constants.KEYBOARD_3] || 
		engine.pressedKeys[constants.NUMPAD_3])
    {
        switchCamera(2);
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
        resetCamera();
    }
    if (engine.pressedKeys[constants.EQUALS] ||
    	engine.pressedKeys[187])
    {
		if (gameState.scene.name == "scene0") {
			changeScene(level1);
		} else {
			changeScene(level0);
		}
    }
}

function moveCarScript(car)
{
	if (!gameState.hasFocus) return; // wait until user clicks on game
	
	// Friction--slow down car
    gameState.speed *= 0.998;
    if (gameState.speed < gameState.maxSpeed/10) {
		gameState.speed *= 0.99;
	}
	if (gameState.speed < 1) {
		gameState.speed *= 0.9;
	}
	
	// Compute rotational speed
	var rSpeed = 0;
	var speedModifier = Math.min(1, 1 / Math.sqrt(Math.abs(gameState.speed)));
	if (Math.abs(gameState.speed) < 10) {
		var temp = Math.max(1, 10 - Math.abs(gameState.speed));
		speedModifier *= 1 / temp;
	}
	if (Math.abs(gameState.speed) < 1) {
		speedModifier *= Math.abs(gameState.speed);
	}
	if (gameState.speed < 0) {
		speedModifier *= -1;
	}
	
	var pressedKeys = engine.pressedKeys;
	if (pressedKeys[constants.UP_ARROW]) {
		gameState.speed += gameState.accel * engine.frameDuration;
	}
	if (pressedKeys[constants.DOWN_ARROW]) {
		if (gameState.speed > constants.speedThreshold) {
			// slow down
			gameState.speed *= 0.9;
		} else {
			// put it in reverse
			gameState.speed -= gameState.accel * engine.frameDuration;
		}
	}
	if (pressedKeys[constants.RIGHT_ARROW]) {
		rSpeed = gameState.rSpeed * speedModifier * -1;
	}
	if (pressedKeys[constants.LEFT_ARROW]) {
		rSpeed = gameState.rSpeed * speedModifier;
	}
	
	var speed = gameState.speed;
	
	// Don't go over max speed in forward or reverse
	gameState.speed = Math.min(gameState.speed, gameState.maxSpeed);
	gameState.speed = Math.max(gameState.speed, -gameState.maxSpeed/2);
	
	// Apply minimum threshold for speed (prevent drifting forever)
    if (Math.abs(gameState.speed) < constants.speedThreshold) {
		gameState.speed = 0;
		rSpeed = 0;
	}
	
	var fwd = getForwardDirection(car);
	car.position.x -= fwd.x * speed * engine.frameDuration;
	car.position.z -= fwd.z * speed * engine.frameDuration;
	rotateAroundWorldAxis(car, constants.YAXIS, rSpeed);
	
	var blocker = document.getElementById('blocker');
	blocker.innerHTML = Math.round(speed) + ' mph';
}

/// Check if the car has driven through a ring, and handle it if so
function ringScript(car) 
{
	if (!gameState.hasFocus) return; // wait until user clicks on game
	var collidedWithNextRing = false;
	var collisions = getCollisionsForComplexObject(car);
	collisions.forEach(function(o) {
		if (o.object.name == gameState.nextRing.name) {
			collidedWithNextRing = true;
		}
	});
	
	if (collidedWithNextRing) {
		gameState.nextRing.material.color.setHex( 0xffffff );
		
		var index = gameState.rings.indexOf(gameState.nextRing);
		var nextIndex = (index + 1) % gameState.rings.length;
		
		gameState.nextRing = gameState.rings[nextIndex];
		gameState.nextRing.material.color.setHex( 0xffff00 );
	}
}

/// Check if car is on the road, and if not, punish the player
function roadScript(car) 
{
	if (!gameState.hasFocus) return; // wait until user clicks on game
	
	var origin = car.position.clone().add(new THREE.Vector3(0,1,0));
	var down = new THREE.Vector3(0,-1,0);
	var raycaster = new THREE.Raycaster( origin, down, 0 );
	var track = gameState.scene.getObjectByName("raceTrack");
	var intersections = raycaster.intersectObject( track, true );
	
	var defaultRenderer = engine.renderers["defaultRenderer"];
	if (!engine.renderers["filmPassRenderer"]) {
		createFilmPassRenderer();
	}
	var filmPassRenderer = engine.renderers["filmPassRenderer"];
	
	if (intersections.length < 1 && 
		gameState.renderer === defaultRenderer) {
		gameState.onTrack = false;
		
		// the car left the track, change the renderer
		gameState.renderer = filmPassRenderer;
		
		// pause bgm and play static
		gameState.bgm.pause();
		engine.sounds["static"].play();
	} else if (intersections.length > 0 && 
		gameState.renderer === filmPassRenderer) {
		gameState.onTrack = true;
		
		// the car is back on the track
		gameState.renderer = defaultRenderer;
		
		// pause static and play bgm
		engine.sounds["static"].pause();
		gameState.bgm.play();
	}
}
