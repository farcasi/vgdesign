//----------------------------------------------------------------------//
// THE MAIN CODE FOR THE GAME
//----------------------------------------------------------------------//

window.onload = function()
{
	var centerFrame = document.getElementById('centerFrame');
	
	// Start engine
	engine.DEBUG = false;
	initEngineInContainer(centerFrame);
	
	// Parse a new scene and start the game loop
	parseScene(level0);
	setupScene();
	setupPointerLockControls();

	startGameLoop();
}

/// Make some initial changes to the scene
function setupScene() 
{
	var tube = gameState.scene.getObjectByName("cylinder");
	var torus = gameState.scene.getObjectByName("torus");
	var block = gameState.scene.getObjectByName("cube");
	
	// scatter copies of each object around the scene
	for (var i = 0; i < 20; i++) {
		makeRandomClone(tube);
	}
	for (var i = 0; i < 40; i++) {
		makeRandomClone(block);
	}
	makeRandomClone(torus);
	
	// make debug text white
	document.getElementById(engine.DEBUG_CONTAINER_ID).style.color = 'white';
	
	// create blocking div
	var blocker = document.createElement('div');
	blocker.id = 'blocker';
	blocker.style.position = 'relative';
	blocker.style.width = '100%';
	blocker.style.height = '100%';
	blocker.style.backgroundColor = 'rgba(0,0,0,0.5)';
	blocker.style.fontSize = '40px';
	blocker.innerHTML = "Game Paused";
	//document.getElementById(engine.GAME_CONTAINER_ID).appendChild(blocker);
	
	// create instructions div
	var instructions = document.createElement('div');
	instructions.id = 'instructions';
	
	var instructionSpan = document.createElement('span');
	instructionSpan.style.fontSize = '40px';
	instructionSpan.innerHTML = "Click to play";
	instructions.appendChild(instructionSpan);
	
	var brHTML = document.createElement('br');
	instructions.appendChild(brHTML);
	instructions.innerHTML += "(W, A, S, D = Move, MOUSE = Look around)";
	document.getElementById(engine.GAME_CONTAINER_ID).appendChild(instructions);
}

function makeRandomClone(object)
{
	var clone = object.clone();
	var x = Math.floor(Math.random() * 300)-150;
	var z = Math.floor(Math.random() * 300)-150;
	var rot = Math.random() * 2 * Math.PI;
	clone.position.setX(x);
	clone.position.setZ(z);
	clone.rotateZ(rot);
	gameState.scene.add(clone);
	return clone;
}

//----------------------------------------------------------------------//
// Pointerlock controls
//----------------------------------------------------------------------//

/// Sources:https://www.html5rocks.com/en/tutorials/pointerlock/intro/
/// 		https://threejs.org/examples/misc_controls_pointerlock.html
function setupPointerLockControls()
{
	var havePointerLock = 'pointerLockElement' in document ||
		'mozPointerLockElement' in document ||
		'webkitPointerLockElement' in document;
	
	if (havePointerLock) {
		// attach pointerlock to canvas
		var canvas = document.getElementById(engine.CANVAS_ID);
		var blocker = document.getElementById("blocker");
		var instructions = document.getElementById("instructions");
		
		var pointerlockchange = function ( event ) {
			if ( document.pointerLockElement === canvas || 
				 document.mozPointerLockElement === canvas || 
				 document.webkitPointerLockElement === canvas ) {
				// Pointer was just locked
				// Enable the mousemove listener
				//document.addEventListener("mousemove", this.moveCallback, false);
				
				gameState.controlsEnabled = true;
				gameState.controls.enabled = true;
				
				//blocker.style.display = 'none';
			} else {
				// Pointer was just unlocked
				// Disable the mousemove listener
				//document.removeEventListener("mousemove", this.moveCallback, false);
				
				gameState.controls.enabled = false;
				gameState.controlsEnabled = false;
				
				//blocker.style.display = '-webkit-box';
				//blocker.style.display = '-moz-box';
				//blocker.style.display = 'box';
			}
		};
		
		var pointerlockerror = function ( event ) {
			instructions.style.display = '';
			instructions.innerHTML = 'An error occured. Please refresh the page.';
		};
		
		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
		
		// Listen for clicking on canvas to activate pointerlock
		canvas.addEventListener( 'click', function ( event ) {
			// Ask the browser to lock the pointer
			canvas.requestPointerLock = canvas.requestPointerLock ||
						 canvas.mozRequestPointerLock ||
						 canvas.webkitRequestPointerLock;
			canvas.requestPointerLock();
		}, false );

		// Listen for escape key to deactivate pointerlock
		canvas.addEventListener( 'keydown', function ( event ) {
			var key = event.keyCode ? event.keyCode : event.which;
			if (key == constants.ESC_KEY) { 
				// Ask the browser to release the pointer
				document.exitPointerLock = document.exitPointerLock ||
							   document.mozExitPointerLock ||
							   document.webkitExitPointerLock;
				document.exitPointerLock();
			}
		}, false );
	} else {
		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
	}
}
