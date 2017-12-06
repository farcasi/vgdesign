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

	startGameLoop();
}

/// Make some initial changes to the scene
function setupScene() 
{	
	gameState.scene.background = new THREE.Color().setHSL( 0.6, 0.6, 0.8 );
	
	// make debug text white
	document.getElementById(constants.PREGEN_DEBUG_CONTAINER_ID).style.color = 'white';
	
	// create blocking div
	var blocker = document.createElement('div');
	blocker.id = 'blocker';
	blocker.style.position = 'absolute';
	blocker.style.width = '100%';
	blocker.style.height = '100%';
	blocker.style.fontSize = '40px';
	blocker.style.zIndex = '100';
	blocker.style.top = '550px';
	blocker.innerHTML = 'Game Paused';
	document.getElementById('centerFrame').appendChild(blocker);
	
	// create instructions div
	var instructions = document.createElement('div');
	instructions.id = 'instructions';
	
	var instructionSpan = document.createElement('span');
	instructionSpan.style.fontSize = '40px';
	instructionSpan.innerHTML = "Click to play";
	instructions.appendChild(instructionSpan);
	
	var brHTML = document.createElement('br');
	instructions.appendChild(brHTML);
	instructions.innerHTML += "Arrow keys = Move";
	instructions.appendChild(brHTML);
	instructions.innerHTML += "Number keys = Change camera";
	document.getElementById('centerFrame').appendChild(instructions);
	
	gameState.rings = [
		gameState.scene.getChildByName("ring1"),
		gameState.scene.getChildByName("ring2"),
		gameState.scene.getChildByName("ring3"),
		gameState.scene.getChildByName("ring4")
	]
	gameState.nextRing = gameState.scene.getChildByName("ring1");
	gameState.nextRing.material.color.setHex( 0xffff00 );
}

function makeRandomClone(object, maxX, maxZ)
{
	var clone = object.clone();
	var x = Math.floor(Math.random() * maxX)-maxX/2;
	var z = Math.floor(Math.random() * maxZ)-maxZ/2;
	var rot = Math.random() * 2 * Math.PI;
	clone.position.setX(x);
	clone.position.setZ(z);
	clone.rotateZ(rot);
	gameState.scene.add(clone);
	return clone;
}

function createFilmPassRenderer()
{
	var defaultRenderer = engine.renderers["defaultRenderer"];
	var composer = new THREE.EffectComposer(defaultRenderer);

    var renderPass = new THREE.RenderPass(gameState.scene, gameState.camera);    
    var filmPass = new THREE.FilmPass(1.5, 0.325, 512, false);
    filmPass.renderToScreen = true;

    composer.addPass(renderPass);
    composer.addPass(filmPass); 

    engine.renderers["filmPassRenderer"] = composer;
}

gameState.gotFocus = function(event)
{
	if (gameState.bgm && 
		gameState.bgm.paused && 
		gameState.onTrack) {
		gameState.bgm.play();
	}
}

gameState.lostFocus = function(event)
{
	var blocker = document.getElementById('blocker');
	blocker.innerHTML = 'Game Paused';
}
