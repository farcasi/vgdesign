//----------------------------------------------------------------------//
// THE MAIN CODE FOR THE GAME
//----------------------------------------------------------------------//

window.onload = function()
{
	var canvas = createGameArea();
	
	// Start engine
	engine.DEBUG = false;
	initEngine(canvas);
	
	// Parse a new scene and start the game loop
	parseScene(level0);

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
	debugContainer.style.left = (canvas.offsetLeft + 5) + 'px';
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
