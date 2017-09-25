var canvasId = 'gameCanvas';

//----------------------------------------------------------------------//
// THE MAIN CODE FOR THE GAME
//----------------------------------------------------------------------//

window.onload = function()
{
	var canvas = createGameArea();
	
	// Start engine
	engine.DEBUG = true;
	initEngine(canvas);

	gameState.onKeyDown = onKeyDown;
	gameState.score = 0;

	// Parse the scene and start the game loop
	parseScene(level0);
	expandRandom();

	startGameLoop();
}

/// Adds the canvas and <div> tags for debug info, etc. to the page.
var createGameArea = function() 
{
	var centerFrame = document.getElementById('centerFrame');
	
	// Create a canvas and drawing context
	var canvas = document.createElement('canvas');
	canvas.id = canvasId;
	canvas.width = '640';
	canvas.height = '480';
	canvas.tabIndex = 1;
	centerFrame.appendChild(canvas);
	centerFrame.style.minWidth = '640px';
	
	// Define scoreboard for game
	var scoreboard = document.createElement('h2');
	scoreboard.id = 'scoreboard';
	scoreboard.innerHTML = 'Scoreboard';
	centerFrame.appendChild(scoreboard);
	
	// Define div tag for debug printouts
	var debugContainer = document.createElement('div');
	debugContainer.id = 'debugContainer';
	debugContainer.style.color = '#fff';
	debugContainer.style.opacity = '0.8';
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

//----------------------------------------------------------------------//
// CONTROL SCRIPTS
//----------------------------------------------------------------------//

var onKeyDown = function(event)
{
	if (event.defaultPrevented || document.activeElement.id != canvasId) {
		// Do nothing if the default action has been cancelled
		// or we're not focused on the game canvas
		return; 
	}
	
	var scoreboard = document.getElementById("scoreboard");
	var key = event.keyCode ? event.keyCode : event.which;
	//scoreboard.innerHTML = "Keycode: " + key;

	var scene = gameState.scene;
	var sphere = null;

	switch (key) {
	case 37: // left
		sphere = scene.getObjectByName("leftSphere", true);
		break;
	case 39: // right
		sphere = scene.getObjectByName("rightSphere", true);
		break;
	case 38: // up
		sphere = scene.getObjectByName("upSphere", true);
		break;
	case 40: // down
		sphere = scene.getObjectByName("downSphere", true);
		break;
	default: break;
	}
	
	if (sphere != null) {
		if (sphere.scale.x > 1.0) {
			sphere.scale.set(1.0, 1.0, 1.0);
			gameState.score += 1;
			scoreboard.innerHTML = "Score: " + gameState.score;
			expandRandom();
		} else {
			scoreboard.innerHTML = "You missed!";
			gameState.score = 0;
		}
		
		
	}
	
	// Suppress "double action" if event handled
	event.preventDefault();
}

var expandRandom = function() 
{
	var sphereNames = ["leftSphere", "rightSphere", "upSphere", "downSphere"];
	var snum = Math.floor(Math.random() * 4);
	var sphere = gameState.scene.getObjectByName(sphereNames[snum], true);
	sphere.scale.set(2, 2, 2);
	debug("Expanded "+snum);
}

/// sceneControl is called every frame.
var sceneControl = function(sceneNode)
{
	//var elapsedTime = getElapsedTime();
	//var userData = sceneNode["userData"];

	//var children = sceneNode.children;
	//debug("children " + children.length + "\n");
}

//var sceneControl = function(sceneNode)
//{
	//var elapsedTime = getElapsedTime();
	//var userData = sceneNode["userData"];

	//var children = sceneNode.children;
	////debug("children " + children.length + "\n");
	//for (var i=0; i < children.length; i++)
	//{
		//var child = children[i];
		//if (child instanceof THREE.Mesh)
		//{
			//var x = Math.cos(elapsedTime*1.15*(1.0+i*0.1) + 2.0*i);
			//x = 2.0*x*x*x;

			//var y = Math.sin(elapsedTime*1.27 + 2.0*i);
			//y = 2.0*y*y*y;

			//child.position.x = x;
			//child.position.y = y;

			//var s = 0.2 + 0.1 * Math.cos(elapsedTime+i);
			//child.scale.set(s,s,s)
		//}
	//}
//}
