//----------------------------------------------------------------------//
// THE MAIN CODE FOR THE GAME
//----------------------------------------------------------------------//

window.onload = function()
{
	var canvas = createGameArea();
	
	// Start engine
	engine.DEBUG = false;
	initEngine(canvas);
	
	// Start a new game
	gameState.score = 0;
	startScene(level0);

	startGameLoop();
}

/// Adds the canvas and <div> tags for debug info, etc. to the page.
function createGameArea() 
{
	var centerFrame = document.getElementById('centerFrame');
	
	// Create a canvas and drawing context
	var canvas = document.createElement('canvas');
	canvas.id = engine.CANVAS_ID;
	canvas.width = '800';
	canvas.height = '600';
	canvas.tabIndex = 1;
	centerFrame.appendChild(canvas);
	centerFrame.style.minWidth = canvas.width;
	
	// Define div tag for debug printouts
	var debugContainer = document.createElement('div');
	debugContainer.id = 'debugContainer';
	//debugContainer.style.color = '#000';
	//debugContainer.style.opacity = '0.8';
	debugContainer.style.position = 'absolute';
	debugContainer.style.left = '5px';
	debugContainer.style.top = '5px';
	debugContainer.style.textAlign = 'left';
	debugContainer.style.zIndex = '100';
	debugContainer.style.display = 'block';
	
	var debug = document.createElement('pre');
	debug.id = 'debug';
	
	debugContainer.appendChild(debug);
	centerFrame.appendChild(debugContainer);
	
	return canvas;
}

/// Starts a new scene from scene's data.
function startScene(myScene) {
	// Parse the scene and start the game loop
	parseScene(myScene);
	expandRandom();
	
	// set the player object
	gameState.scene.children.forEach(function (node) {
		if (node.name == "mainBall") {
			gameState.player = node;
		}
	
	});
}

//----------------------------------------------------------------------//
// CONTROL SCRIPTS
//----------------------------------------------------------------------//

var expandRandom = function() 
{
	var sphereNames = ["leftSphere", "rightSphere", "downSphere", "upSphere"];
	var snum = Math.floor(Math.random() * 3);
	var sphere = gameState.scene.getObjectByName(sphereNames[snum], true);
	sphere.scale.set(2, 2, 2);
	//debug("Expanded "+snum);
}

/// sceneControl is called every frame.
/// Handles user input.
var sceneControl = function(sceneNode)
{
	var player = gameState.player;
	var camera = gameState.camera;
    var velocity = player.userData.velocity;
	
	// display continuous debug info
	if (engine.DEBUG) {
		engine.debugText = '';
		debug('camera position: '+camera.position.x+','+camera.position.y+','+camera.position.z);
		debug('player position: '+player.position.x+','+player.position.y+','+player.position.z);
		debug('player velocity: '+player.userData.velocity[0]+','+player.userData.velocity[1]+','+player.userData.velocity[2]);
		debug('player rotation: '+player.rotation.x+','+player.rotation.y+','+player.rotation.z);
		debug('player grounded: '+player.userData.isGrounded);
		debug('frame duration: '+engine.frameDuration);
		debug('frames/second: '+(1/engine.frameDuration));
		
		var keyNames = [];
		for (var key in engine.pressedKeys) {
			if (engine.pressedKeys.hasOwnProperty(key)) {
				keyNames.push(key);
			}
		}
		debug('pressed keys: ', keyNames);
		debug('colliding objects: ', gameState.objectsPlayerCollidedWith);
	}
	
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
	var sphere = null;
	var accel = 30.0;
    var maxTilt = 0.3;
    var tiltSpeed = 0.05;
    var rotation = 0.05;
	
	if (engine.pressedKeys[constants.LEFT_ARROW])
    {
		sphere = scene.getObjectByName("leftSphere", true);
		velocity[0] -= accel * engine.frameDuration;
		rotateAroundWorldAxis(player, constants.ZAXIS, rotation);
		if (!player.userData.isGrounded) velocity[0] *= 0.75;
    }
    if (engine.pressedKeys[constants.RIGHT_ARROW])
    {
		sphere = scene.getObjectByName("rightSphere", true);
		velocity[0] += accel * engine.frameDuration;
		rotateAroundWorldAxis(player, constants.ZAXIS, -rotation);
		if (!player.userData.isGrounded) velocity[0] *= 0.75;
    }
    if (engine.pressedKeys[constants.UP_ARROW])
    {
		sphere = scene.getObjectByName("upSphere", true);
		velocity[2] -= accel * engine.frameDuration;
		rotateAroundWorldAxis(player, constants.XAXIS, -rotation);
		if (!player.userData.isGrounded) velocity[0] *= 0.75;
    }
    if (engine.pressedKeys[constants.DOWN_ARROW])
    {
        sphere = scene.getObjectByName("downSphere", true);
	
		velocity[2] += accel * engine.frameDuration;
		rotateAroundWorldAxis(player, constants.XAXIS, rotation);
		if (!player.userData.isGrounded) velocity[0] *= 0.75;
    }
    if (engine.pressedKeys[constants.NUMPAD_2])
    {
        rotateCamera(constants.XAXIS, -2);
    }
    if (engine.pressedKeys[constants.NUMPAD_4])
    {
		rotateCamera(constants.YAXIS, -2);
    }
    if (engine.pressedKeys[constants.NUMPAD_6])
    {
        rotateCamera(constants.YAXIS, 2);
    }
    if (engine.pressedKeys[constants.NUMPAD_8])
    {
        rotateCamera(constants.XAXIS, 2);
    }
    if (engine.pressedKeys[constants.NUMPAD_5])
    {
        resetCamera();
    }
    if (engine.pressedKeys[80]) // P
    {
        player.userData.velocity = [0,0,0];
    }
    if (engine.pressedKeys[68]) // D
    {
        player.userData.velocity = [0,-1,0];
    }
		
	if (sphere !== null) {
		if (sphere.scale.x > 1.0) {
			gameState.score += 1;
			while (sphere.scale.x > 1) {
				sphere.scale.set(1.0, 1.0, 1.0);
				expandRandom();
			}
		} else {
			gameState.score = 0;
		}
	}
	
	// if player goes below "death plane", they lose and restart
	if (player.position.y < -100 || engine.pressedKeys[82]) { // 82 = R
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
	
	
	// Translate camera based on player position
	resetCamera();
}

/// Overriding the gameEngine's resetCamera method to focus on the ball
function resetCamera()
{
	var origin = gameState.original.camera;
	var player = gameState.player;
	
	var eye = origin.eye;
	gameState.camera.position.set( 
		player.position.x + eye[0], 
		player.position.y + eye[1], 
		player.position.z + eye[2] );
	
	gameState.camera.lookAt( player.position );
	
	var vup = origin.vup;
	gameState.camera.up.set( vup[0], vup[1], vup[2] );
}
