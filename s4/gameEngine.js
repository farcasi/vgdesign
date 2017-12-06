//----------------------------------------------------------------------//
// CS 4143 GAME ENGINE BASE
// Author: David Cline 
// Edits by: Michael Farcasin
//----------------------------------------------------------------------//

/*
Description:
	Game Engine Base.
	For use by students in CS 4143 at Oklahoma State University, Fall 2017.
	Provides basic code for loading scenes, loading assets, a game loop, 
	input, and scripting.

Scenes:
	Scene files are typically written in JSON.  The exact format of the
	scenes is specified by the parser. These set up an initial static
	configuration of a game level.

Cross-Origin File Requests
	When testing locally, some of the browsers block 
	"Cross origin" requests that come though the "File" protocol.
	If this is blocked, requests that happen after the page loads will
	not work. For the following browsers, use the following:

	Firefox 
		should allow these requests by default
	Safari 
		has a "Develop" option to disable cross-origin restrictions
	Chrome
		use SimpleHTTPServer to serve files using the http protocol
		instead.  In fact, all of the browswers could be tested
		this way. See description below:

		Python provides a simple http server that can be used to test files
		on the local machine (since the file server will likely not work.
		From the directory that you want to be the root of localhost, 
		run python with the command:
			python -m SimpleHTTPServer
		It should respond with
			Serving HTTP on 0.0.0.0 port 8000 ...
		At this point, in your browser, you should be able to access files
		using the URL
			http://localhost:8000/
*/

//----------------------------------------------------------------------//
// GLOBALS
//----------------------------------------------------------------------//

//--------------- SOME CONSTANTS

var constants = {
	// AXIS CONSTANTS
	XAXIS: new THREE.Vector3(1,0,0),
	YAXIS: new THREE.Vector3(0,1,0),
	ZAXIS: new THREE.Vector3(0,0,1),
	
	// KEYBOARD CONSTANTS
	ESC_KEY: 27,
	SPACE_BAR: 32,
	LEFT_ARROW: 37,
	UP_ARROW: 38,
	RIGHT_ARROW: 39,
	DOWN_ARROW: 40,
	EQUALS: 61,
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	E: 69,
	F: 70,
	G: 71,
	H: 72,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	M: 77,
	N: 78,
	O: 79,
	P: 80,
	Q: 81,
	R: 82,
	S: 83,
	T: 84,
	U: 85,
	V: 86,
	W: 87,
	X: 88,
	Y: 89,
	Z: 90,
	KEYBOARD_0: 48,
	KEYBOARD_1: 49,
	KEYBOARD_2: 50,
	KEYBOARD_3: 51,
	KEYBOARD_4: 52,
	KEYBOARD_5: 53,
	KEYBOARD_6: 54,
	KEYBOARD_7: 55,
	KEYBOARD_8: 56,
	KEYBOARD_9: 57,
	NUMPAD_1: 97,
	NUMPAD_2: 98,
	NUMPAD_3: 99,
	NUMPAD_4: 100,
	NUMPAD_5: 101,
	NUMPAD_6: 102,
	NUMPAD_7: 103,
	NUMPAD_8: 104,
	NUMPAD_9: 105,
	TILDE: 192,
	
	// MISC CONSTANTS
	TERMINAL_VELOCITY: 20,
	PREGEN_DEBUG_CONTAINER_ID: 'debugContainer',
	PREGEN_CANVAS_CONTAINER_ID: 'canvasContainer',
}

//--------------- GAME ENGINE SPECIFIC VARIABLES

var engine = {
	CANVAS_ID: 'gameCanvas',
	
	DEBUG: false, 		// Whether to run in debug mode
	debugText: "",
	
	startTime: 0, 		// When the scene was loaded (in seconds)
	frameStartTime: 0, // When the current frame started
	frameDuration: 0,	// How much time the last frame took
	frameNum: 0,		// How many frames have passed

	renderers: {},
	rendererContainer: undefined,   // A div element that will hold the renderer
	canvas: undefined,				// The game canvas
	loadingManager: undefined,		// loading manager for loading assets
	fontloader: undefined,			// loader for 3D text fonts
	imageloader: undefined,			// loader for images

	mouseX: 0,			// Current position of mouse
	mouseY: 0,			
	mousePrevX: 0,		// Previous position of mouse
	mousePrevY: 0, 
	mouseDown: 0,       // Which mouse button currently down   
	mouseScroll: 0,	    // How much the mouse wheel has scrolled  
	mousePrevScroll: 0, 

	pressedKeys: {},    // Which keys are currently depressed

	touchX: 0,          // The latest touch position 
	touchY: 0,			// (Multitouch not supported)
	touchPrevX: 0,
	touchPrevY: 0,

	accelX: 0,      // accelerometer data including gravity
	accelY: 0,
	accelZ: 0,

	compassHeading: 0,   // compass heading (0 = north)
	
	cameras: [],		// Cameras in the scene
	
	sounds: {},			// Sounds available to be played
};

//--------------- THE CURRENT GAME STATE

var gameState = {
	scene: undefined,     
	camera: undefined,
	renderer: undefined,
	original: undefined,
	lights: [],
	hasFocus: false,
};

//----------------------------------------------------------------------//
// PERFORM GENERAL INITIALIZATION. CREATE THE RENDERER AND LOADING
// MANAGER, AND START LISTENING TO GUI EVENTS.
//———————————————————————————————————//

function initDebugContainer(leftOffset)
{
	// Define div tag for debug printouts
	var debugContainer = document.createElement('div');
	debugContainer.id = constants.PREGEN_DEBUG_CONTAINER_ID;
	//debugContainer.style.color = '#000';
	//debugContainer.style.opacity = '0.8';
	debugContainer.style.position = 'absolute';
	debugContainer.style.left = leftOffset + 'px';
	debugContainer.style.top = '5px';
	debugContainer.style.textAlign = 'left';
	debugContainer.style.zIndex = '100';
	debugContainer.style.display = 'block';
	
	var debugText = document.createElement('pre');
	debugText.id = 'debug';
	
	debugContainer.appendChild(debugText);
	return debugContainer;
}

//----------------------------------------------------------------------//

function initEngineFullScreen()
{
	debug("initEngineFullScreen()");

	// Create a div element and the canvas
	var container = document.createElement("div");
	container.id = constants.PREGEN_DEBUG_CONTAINER_ID;
	var canvas = document.createElement("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	engine.fullScreen = true;
	document.body.appendChild(container);
	container.appendChild(canvas);
	
	var debugContainer = initDebugContainer(canvas.offsetLeft + 5);
	container.appendChild(debugContainer);

	initEngineWithCanvas(canvas);
}

//----------------------------------------------------------------------//

function initEngineInContainer(canvasContainer) 
{
	debug("initEngineInContainer(canvasContainer)");
	
	// Create a canvas and drawing context
	var canvas = document.createElement('canvas');
	canvas.id = engine.CANVAS_ID;
	canvas.width = '800';
	canvas.height = '600';
	canvas.tabIndex = 1;
	canvasContainer.appendChild(canvas);
	canvasContainer.style.minWidth = canvas.width;
	
	var debugContainer = initDebugContainer(canvas.offsetLeft + 5);
	canvasContainer.appendChild(debugContainer);
	
	initEngineWithCanvas(canvas);
}

//----------------------------------------------------------------------//

function initEngineWithCanvas(canvas) 
{
	debug("initEngineWithCanvas(canvas)");
	
	// Update engine
	engine.CANVAS_ID = canvas.id;
	
	// By default, no special controls
	gameState.controlsEnabled = false;

	// Reset start time
	engine.startTime = (new Date()).getTime() * 0.001; 
	engine.frameStartTime = 0;
	engine.frameNum = 0;
	engine.frameDuration = 1.0/60.0;
	engine.canvas = canvas;

	// Make the loading manager for Three.js.
	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function (item, loaded, total) { };
	
	// Initialize loaders
	fontloader = new THREE.FontLoader(engine.loadingManager);
	imageloader = new THREE.ImageLoader(engine.loadingManager);

	// Create renderer and add it to the container (div element)
	var renderer = new THREE.WebGLRenderer( {antialias:true, canvas:canvas} );
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(canvas.width, canvas.height);
	renderer.shadowMap.enabled	= true;
	renderer.shadowMap.type		= THREE.PCFSoftShadowMap;
	engine.renderers["defaultRenderer"] = renderer;
	gameState.renderer = renderer;

	// Add event listeners so we can respond to events
	window.addEventListener( 'resize', gOnWindowResize );
	//
	document.addEventListener( "click", gOnClick );
	document.addEventListener( "mouseup", gOnMouseUp );
	document.addEventListener( "mousedown", gOnMouseDown );
	document.addEventListener( "mousemove", gOnMouseMove );
	document.addEventListener( "mousewheel", gOnMouseWheel );
	document.addEventListener( "DOMMouseScroll", gOnMouseWheel ); // firefox
	//
    document.addEventListener( "keydown", gOnKeyDown );
    document.addEventListener( "keyup", gOnKeyUp );
    //
    // mobile events
    engine.touchDevice = ("ontouchstart" in document.documentElement)
    if (engine.touchDevice)
    {
        canvas.addEventListener( "touchstart", gOnTouchStart );
        canvas.addEventListener( "touchmove", gOnTouchMove );
        window.addEventListener( "devicemotion", gOnMotion );
        //
        var dor = "deviceorientation";
        if (window.chrome) dor = "deviceorientationabsolute";
        window.addEventListener( dor, gOnOrientation );
    }
}

function initEngine(canvas)
{
	initEngineWithCanvas(canvas);
}

//------------------------------------------------------------------//
// CANVAS FOCUS
//------------------------------------------------------------------//

function gotFocus(event) 
{
	gameState.hasFocus = true;
	var rect = engine.canvas.getBoundingClientRect();
	engine.mouseX = event.clientX - rect.left;
	engine.mouseY = event.clientY - rect.top;
	engine.mousePrevX = event.clientX - rect.left;
	engine.mousePrevY = event.clientY - rect.top;
	console.log("Got mouse click at "+event.clientX + ","+ event.clientY);
	
	if (gameState.unpauseWithFocus) {
		gameState.unpauseWithFocus.forEach(function (audioElem) {
			audioElem.play();
		});
	}
	if (gameState.gotFocus) gameState.gotFocus(event);
}

function lostFocus(event) 
{
	gameState.hasFocus = false;
	gameState.unpauseWithFocus = [];
	Object.keys(engine.sounds).forEach(function (key) {
		if (!engine.sounds[key].paused) {
			engine.sounds[key].pause();
			gameState.unpauseWithFocus.push(engine.sounds[key]);
		}
	});
	if (gameState.lostFocus) gameState.lostFocus(event);
}

//------------------------------------------------------------------//
// WINDOW RESIZE LISTENER
//------------------------------------------------------------------//

function gOnWindowResize(event) 
{
	debug("onWindowResize");

	if (engine.fullScreen)
	{
		engine.canvas.width = window.innerWidth;
		engine.canvas.height = window.innerHeight;
	}

	var width = engine.canvas.width;
	var height = engine.canvas.height;

	if (gameState.camera)
	{
		gameState.camera.aspect = width / height;
		gameState.camera.updateProjectionMatrix();
		gameState.renderer.setSize(width, height);
	}
}

//------------------------------------------------------------------//
// MOUSE LISTENERS
//------------------------------------------------------------------//

function gOnClick(event)
{
	debug("onClick\n");
	
	if (event.defaultPrevented || document.activeElement.id != engine.CANVAS_ID) {
		// Do nothing if the default action has been cancelled
		// or we're not focused on the game canvas
		return; 
	}
	
	if (gameState.onClick) gameState.onClick(event);
}

function gOnMouseUp(event) 
{
	debug("onMouseUp\n");
	
	if (event.defaultPrevented || document.activeElement.id != engine.CANVAS_ID) {
		// Do nothing if the default action has been cancelled
		// or we're not focused on the game canvas
		return; 
	}
	
	engine.mouseDown = 0;
	if (gameState.onMouseUp) gameState.onMouseUp(event);
}	

function gOnMouseDown(event) 
{
	debug("onMouseDown " + event.which + "\n");
	var rect = engine.canvas.getBoundingClientRect();
	
	if (event.defaultPrevented || document.activeElement.id != engine.CANVAS_ID) {
		// Do nothing if the default action has been cancelled
		// or we're not focused on the game canvas
		
		if (document.activeElement.id != engine.CANVAS_ID) {
			// If user clicks on canvas, call gotFocus
			if (event.clientX > rect.left && event.clientY > rect.top &&
				event.clientX < rect.right && event.clientY < rect.bottom) {
				gotFocus(event);
			}
		}
		
		return; 
	}
	
	// if user clicks outside the canvas, call lostFocus
	if (!(event.clientX > rect.left && event.clientY > rect.top &&
		event.clientX < rect.right && event.clientY < rect.bottom)) {
		lostFocus(event);
	}
	
	engine.mouseDown = event.which;
	if (gameState.onMouseDown) gameState.onMouseDown(event);
}	

function gOnMouseMove(event) 
{
	//debug("onMouseMove " + event.clientX + "," + event.clientY + "\n");
	
	if (event.defaultPrevented || document.activeElement.id != engine.CANVAS_ID) {
		// Do nothing if the default action has been cancelled
		// or we're not focused on the game canvas
		return;
	}
	
	// don't update previous position yet because asynchronous
	//mousePrevX = mouseX;  
	//mousePrevY = mouseY;

	var rect = engine.canvas.getBoundingClientRect();
	engine.mouseX = event.clientX - rect.left;
	engine.mouseY = event.clientY - rect.top;
	if (gameState.onMouseMove) gameState.onMouseMove(event);
}

function gOnMouseWheel(event)
{
	debug("onMouseWheel " + engine.mouseScroll + "\n");
	
	if (event.defaultPrevented || document.activeElement.id != engine.CANVAS_ID) {
		// Do nothing if the default action has been cancelled
		// or we're not focused on the game canvas
		return; 
	}

	if (event.detail > 0 || event.detail < 0) {
		engine.mouseScroll += event.detail/120.0;
	}
	if (event.wheelDelta > 0 || event.wheelDelta < 0) {
		engine.mouseScroll += event.wheelDelta/120.0;
	}

	if (gameState.onMouseWheel) gameState.onMouseWheel(event);
}

function getMouseDirection()
{
	// Get the position on the screen in "normalized" device coordinates.
	var canvas = engine.canvas;
    var rect = canvas.getBoundingClientRect();
    var mx = clientX - rect.left;
    var my = canvas.height - (clientY - rect.top);
    var vector = new THREE.Vector3(
        2*(mx / canvas.width) - 1,
        2*(my / canvas.height) - 1,
        0.5);

	// Get the direction in space to that position in the current camera.
    vector = vector.unproject(camera);
    return vector.sub(camera.position).normalize();
}

/// Function to get the set of objects that intersect the current mouse position
/// params:
/// clientX, clientY - the screen coordinates (event.clientX)
/// canvas - the canvas where we are drawing 
/// camera - the camera we are viewing the scene through
/// objects - the list of objects to cast against (children of root)
/// return:
/// an array of objects
function rayCastSelect(clientX, clientY, canvas, camera, objects) 
{
    var direction = getMouseDirection(clientX, clientY, canvas, camera);

    // Create a Raycaster object and intersect against the objects
    var raycaster = new THREE.Raycaster(camera.position, direction);
    var intersects = raycaster.intersectObjects(objects);
    return intersects;
}

/// Gets the 3D position of the mouse on the screen
/// Source: https://jsfiddle.net/atwfxdpd/10/
function getMousePosition(clientX, clientY, canvas, camera)
{
    var direction = getMouseDirection(clientX, clientY, canvas, camera);
    var distance = -camera.position.z / direction.z;
    var position = camera.position.clone().add( 
		direction.multiplyScalar( distance ) );
    
	return position;
}

//------------------------------------------------------------------//
// KEY LISTENERS
//------------------------------------------------------------------//

function gOnKeyDown(event) 
{
	if (event.defaultPrevented || document.activeElement.id != engine.CANVAS_ID) {
		// Do nothing if the default action has been cancelled
		// or we're not focused on the game canvas
		return; 
	}
	
	var key = event.keyCode ? event.keyCode : event.which;
	engine.pressedKeys[key] = true;
	if (key == constants.TILDE) {
		engine.DEBUG = !engine.DEBUG;
        if (!engine.DEBUG) {
			clearDebugInfo();
		}
	}

	if (gameState.onKeyDown) gameState.onKeyDown(event);
	
	// Suppress "double action" if event handled
	event.preventDefault();
}

function gOnKeyUp(event)
{
	if (event.defaultPrevented || document.activeElement.id != engine.CANVAS_ID) {
		// Do nothing if the default action has been cancelled
		// or we're not focused on the game canvas
		return; 
	}
	
	var key = event.keyCode ? event.keyCode : event.which;
	delete engine.pressedKeys[key];

	if (gameState.onKeyUp) gameState.onKeyUp(event);
	
	// Suppress "double action" if event handled
	event.preventDefault();
}

//------------------------------------------------------------------//
// TOUCH EVENTS
//------------------------------------------------------------------//

function gOnTouchStart(event)
{
	debug("onTouchStart\n");
	
	if (event.defaultPrevented || document.activeElement.id != engine.CANVAS_ID) {
		// Do nothing if the default action has been cancelled
		// or we're not focused on the game canvas
		return; 
	}

	// handle a single touch event
    var rect = canvas.getBoundingClientRect();
    var touchObj = event.changedTouches[0]; // first event
    var touchX = touchObj.clientX - rect.left;
    var touchY = touchObj.clientY - rect.top;

    engine.touchX = touchX;
    engine.touchY = touchY;

    if (gameState.onTouchStart) gameState.onTouchStart(event);
	event.preventDefault();
}

function gOnTouchMove(event)
{
	debug("onTouchMove\n");

	if (event.defaultPrevented || document.activeElement.id != engine.CANVAS_ID) {
		// Do nothing if the default action has been cancelled
		// or we're not focused on the game canvas
		return; 
	}

	// handle a single touch event
    var rect = canvas.getBoundingClientRect();
    var touchObj = event.changedTouches[0]; // first event
    var touchX = touchObj.clientX - rect.left;
    var touchY = touchObj.clientY - rect.top;

    engine.touchX = touchX;
    engine.touchY = touchY;

    if (gameState.onTouchMove) gameState.onTouchMove(event);
	event.preventDefault();
}

function gOnTouchEnd(event)
{
	debug("onTouchEnd\n");
	engine.touchX = undefined;
	engine.touchY = undefined;
	if (gameState.onTouchEnd) gameState.onTouchEnd(event);
	event.preventDefault();
}

//------------------------------------------------------------------//
// ORIENTATION (compass) AND ACCELERATION
//------------------------------------------------------------------//

function gOnOrientation(event)
{
	debug("onOrientation\n");
	
	if (event.defaultPrevented || document.activeElement.id != engine.CANVAS_ID) {
		// Do nothing if the default action has been cancelled
		// or we're not focused on the game canvas
		return; 
	}
	
    var w = engine.canvas.width;
    var h = engine.canvas.height;

    var compassHeading = event.webkitCompassHeading;
    var alpha = event.alpha || 0;
    
    var angle = (-90-alpha) * Math.PI / 180.0;
    if (compassHeading) angle = (alpha-90) * Math.PI / 180.0;

    engine.angle = angle;
    if (gameState.onOrientation) gameState.onOrientation(event);

}

function gOnMotion(event)
{
	debug("onMotion\n");
	
	if (event.defaultPrevented || document.activeElement.id != engine.CANVAS_ID) {
		// Do nothing if the default action has been cancelled
		// or we're not focused on the game canvas
		return; 
	}

	var dx = event.accelerationIncludingGravity.x || 0;
    var dy = event.accelerationIncludingGravity.y || 0;
    var dz = event.accelerationIncludingGravity.z || 0;
    
    // If not chrome, assume safari
    if (window.chrome === undefined) 
    {
    	dx = -dx;
    	dy = -dy;
    	dz = -dz;
    }

    engine.accelX = dx;
    engine.accelY = dy;
    engine.accelZ = dz;

    if (gameState.onMotion) gameState.onMotion(event);
}

//----------------------------------------------------------------------//
// PRINT A DEBUG MESSAGE
//----------------------------------------------------------------------//

function debug(message)
{
	console.log(message);
	//if (engine.DEBUG) // Commented out for now to use addDebugInfo
	//{
		//var element = document.getElementById("debug");
		//if (element === undefined) return;

		//engine.debugText += message;
		//var n = engine.debugText.length;
		//if (n > 250) 
		//{
			//engine.debugText = engine.debugText.substring(n-250);
		//}
		//element.innerHTML = engine.debugText;
	//}
}

/// Adds debug info to the "debug" element.
/// Useful for displaying variables.
/// Both this method and debug() use the "debug" element, so 
/// using both may produce unpredictable results.
function addDebugInfo(message, textArray)
{
	if (engine.DEBUG && engine.canvas !== undefined)
	{
		var element = document.getElementById("debug");
		if (element === undefined) return;

		// add debug text
		engine.debugText += message;
		if (textArray !== undefined) {
			textArray.forEach( function (textValue) {
				engine.debugText += textValue + ' ';
			});
		}
		engine.debugText += '\n';
		
		element.innerHTML = engine.debugText;
	}
}

function clearDebugInfo() 
{
	engine.debugText = '';
	document.getElementById("debug").innerHTML = '';
}

//----------------------------------------------------------------------//
// GET THE ELAPSED TIME (SINCE THE PAGE LOADED) IN SECONDS
//----------------------------------------------------------------------//

function getElapsedTime()
{
	var d = new Date();
	var t = d.getTime() * 0.001 - engine.startTime;
	return t;
}

//----------------------------------------------------------------------//
// LOAD A SCENE (ASYNCHRONOUSLY)
// THE SCENE IS LOADED FROM THE SPECIFIED URL AS A STRING, AND THEN
// PARSED AS A JSON OBJECT.  AT THAT POINT parseScene IS CALLED ON
// IT, WHICH RECURSIVELY WALKS THE parseTree CREATING A Three.js scene.
//----------------------------------------------------------------------//

function loadScene(sceneURL)
{
	var httpRequest = new XMLHttpRequest();
	httpRequest.open("GET", sceneURL, true);
	httpRequest.send(null);
	httpRequest.onload = 
		function() {
			debug("loading " + sceneURL + " ...");
            var jsonParseTree = JSON.parse(httpRequest.responseText);
            debug("parsing");
            parseScene(jsonParseTree);
            debug("done.");
        }
}

//----------------------------------------------------------------------//
// ENTRY POINT TO RECURSIVE FUNCTION THAT TRAVERSES THE JSON PARSE
// TREE AND MAKES A SCENE. 
//----------------------------------------------------------------------//

function parseScene(jsonParseTree)
{
	debug("parseScene");

	var scene = new THREE.Scene();
	gameState.scene = scene;
	parseSceneNode(jsonParseTree, scene);
}

function changeScene(jsonParseTree)
{
	debug("changeScene");

	var scene = gameState.scene;
	clearScene(); //TODO: update renderers with new cameras
	parseSceneNode(jsonParseTree, scene);
}

/// Source: https://stackoverflow.com/questions/33256465/three-js-reload-scene-from-start
function clearScene() {
    var scene = gameState.scene;
    var to_remove = [];

    scene.traverse ( function( child ) {
        if ( !child.userData.keepMe === true ) {
            to_remove.push( child );
         }
    } );

    for ( var i = 0; i < to_remove.length; i++ ) {
        scene.remove( to_remove[i] );
    }
    
    Object.keys(engine.sounds).forEach(function (key) {
        engine.sounds[key].pause();
        engine.sounds[key].src = '';
    });
    engine.sounds = {};
    engine.lights = [];

    gameState.lights = [];
    delete gameState.camera;
}

//----------------------------------------------------------------------//
// THE MAIN RECURSIVE FUNCTION OF THE PARSER.  
// THE JOB OF parseSceneNode IS TO TRAVERSE THE JSON OBJECT jsonNode 
// AND POPULATE A CORRESPONDING Three.js SceneNode
//----------------------------------------------------------------------//

function parseSceneNode(jsonNode, sceneNode)
{
	debug("parseSceneNode " + jsonNode["name"] + ":" + jsonNode["type"]);
	if (jsonNode === undefined || sceneNode === undefined) return;

	// Handle the transform of the node (translation, rotation, etc.)
	parseTransform(jsonNode, sceneNode);

	// Load any script files (note that these are not scripts attached
	// to the current node, just files that contain code.)
	if ("scriptFiles" in jsonNode) {
		var scriptList = jsonNode["scriptFiles"];
		for (var i=0; i<scriptList.length; i++) {
			var scriptURL = scriptList[i];
			loadScript(scriptURL);
		}
	}

	// User data that will be placed in the node. Can be arbitrary.
	// Includes the names of any scripts attached to the node.
	if ("userData" in jsonNode) {
		sceneNode["userData"] = jsonNode["userData"];
	} else {
		sceneNode["userData"] = {};
	}

	// Load and play background music
	if ("backgroundMusic" in jsonNode) {
		var audio = document.createElement("audio");
		audio.preload = true;
		audio.loop = true;
		audio.autoplay = false;
		audio.src = jsonNode["backgroundMusic"];
		document.body.appendChild(audio);
	
		engine.sounds["backgroundMusic"] = audio;
		gameState.bgm = audio;
		debug("loaded " + jsonNode["backgroundMusic"]);
	}

	// The name of the node (useful to look up later in a script)
	if ("name" in jsonNode) {
		sceneNode["name"] = jsonNode["name"];
	}

	// Whether the node starts out as visible.
	if ("visible" in jsonNode) {
		sceneNode.visible = jsonNode["visible"];
	}
	
	// other properties
	if ("castShadow" in jsonNode)	sceneNode["castShadow"] = jsonNode["castShadow"];
	if ("frustumCulled" in jsonNode)	sceneNode["frustumCulled"] = jsonNode["frustumCulled"];
	if ("matrixAutoUpdate" in jsonNode)	sceneNode["matrixAutoUpdate"] = jsonNode["matrixAutoUpdate"];
	if ("matrixWorldNeedsUpdate" in jsonNode)	sceneNode["matrixWorldNeedsUpdate"] = jsonNode["matrixWorldNeedsUpdate"];
	if ("receiveShadow" in jsonNode)	sceneNode["receiveShadow"] = jsonNode["receiveShadow"];

	// Traverse all the child nodes. The typical code pattern here is:
	//   1. call a special routine that creates the child based on its type.  
	//      This routine also deals with attributes specific to that node type. 
	//   2. Make a recursive call to parseSceneNode, which handles general
	//      properties that any node can include. 

	if ("children" in jsonNode)
	{
		var children = jsonNode["children"];
		for (var i=0; i<children.length; i++)
		{
			var childJsonNode = children[i];
			var childType = childJsonNode["type"];
			if (typeof childType === 'string' || childType instanceof String) {
				childType = childType.toLowerCase();
			
				if (childType == "node") { // empty object to hold a transform
					var childSceneNode = new THREE.Object3D();
					sceneNode.add(childSceneNode);
					parseSceneNode(childJsonNode, childSceneNode);
				}
				else if (childType == "mesh" || childType == "sprite") {
					var mesh = parseMesh(childJsonNode);
					sceneNode.add(mesh);
					parseSceneNode(childJsonNode, mesh);
				}
				else if (childType == "text") {
					parseText(childJsonNode, sceneNode);
				}
				else if (childType.includes("camera")) {
					var camera = parseCamera(childJsonNode);
					sceneNode.add(camera);
					if (gameState.camera === undefined) gameState.camera = camera;
					parseSceneNode(childJsonNode, camera);
				}
				else if (childType.includes("light")) {
					var light = parseLight(childJsonNode);
					gameState.lights.push(light);
					sceneNode.add(light);
					parseSceneNode(childJsonNode, light);
				}
				else if (childType == "objfile") {
					parseObjFile(childJsonNode, sceneNode);
				}
				else if (childType == "sound") {
					parseSound(childJsonNode, sceneNode);
				}
			}
		}
	}
	
	// Optional PointLock controls
	if ("controls" in jsonNode) {
		var controls = parseControls(jsonNode["controls"], gameState.camera);
		sceneNode.add(controls.getObject());
		gameState.controls = controls;
		gameState.controlsEnabled = true;
		setupPointerLockControls();
	}
}

//----------------------------------------------------------------------//
// PARSE CONTROLS
//----------------------------------------------------------------------//

/// Parse special controls for the camera
function parseControls(controlsType, camera)
{
	debug("parseControls");
	
	var controls;
	
	switch (controlsType) {
		case "pointerLock":
		default: controls = new THREE.PointerLockControls( camera );
	}
	
	return controls;
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
		
		var pointerlockchange = function ( event ) {
			if ( document.pointerLockElement === canvas || 
				 document.mozPointerLockElement === canvas || 
				 document.webkitPointerLockElement === canvas ) {
				// Pointer was just locked
				// Enable the mousemove listener
				//document.addEventListener("mousemove", this.moveCallback, false);
				
				gameState.controlsEnabled = true;
				gameState.controls.enabled = true;
			} else {
				// Pointer was just unlocked
				// Disable the mousemove listener
				//document.removeEventListener("mousemove", this.moveCallback, false);
				
				gameState.controls.enabled = false;
				gameState.controlsEnabled = false;
			}
		};
		
		var pointerlockerror = function ( event ) {
			// do nothing
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

//----------------------------------------------------------------------//
// PARSE A TRANSFORM - I don't like this function and want to remove it,
// 					   but am keeping it for legacy code (or close enough)
//----------------------------------------------------------------------//

function parseTransform(jsonNode, sceneNode)
{
	debug("parseTransform\n");

	if ("translate" in jsonNode) {
		var translate = jsonNode["translate"];
		sceneNode.position.x += translate[0];
		sceneNode.position.y += translate[1];
		sceneNode.position.z += translate[2];
	}
	if ("scale" in jsonNode) {
		var scale = jsonNode["scale"];
		sceneNode.scale.x *= scale[0];
		sceneNode.scale.y *= scale[1];
		sceneNode.scale.z *= scale[2];
	}
	if ("rotate" in jsonNode) {
		var rotate = jsonNode["rotate"];
		var axis = new THREE.Vector3(rotate[0], rotate[1], rotate[2]);
		var radians = rotate[3];
		sceneNode.rotateOnAxis(axis, radians);
	}
}

//----------------------------------------------------------------------//
// PARSE A PERSPECTIVE CAMERA
//----------------------------------------------------------------------//

function parseCamera(jsonNode) 
{
	debug("parseCamera\n");
	
	if (jsonNode === undefined || jsonNode["type"] === undefined) {
		var camera = parsePerspectiveCamera(jsonNode);
	}
	else if (jsonNode["type"] == "orthographicCamera") {
		var camera = parseOrthographicCamera(jsonNode);
	}
	else {
		// default to perspective Camera
		var camera = parsePerspectiveCamera(jsonNode);
	}
	
	var position = [0.0, 0.0, 100.0];
	var up = [0.0, 1.0, 0.0];
	var target = [0.0, 0.0, 0.0];
	var zoom = 1;
	
	if ("position" in jsonNode) position = jsonNode["position"];
	if ("eye"    in jsonNode) position    = jsonNode["eye"];
	if ("vup"    in jsonNode) up    = jsonNode["vup"];
	if ("up"    in jsonNode) up    = jsonNode["up"];
	if ("center" in jsonNode) target = jsonNode["center"];
	if ("target" in jsonNode) target = jsonNode["target"];
	if ("zoom" in jsonNode) zoom = jsonNode["zoom"];
	
	camera.position.set( position[0], position[1], position[2] );
	camera.up.set( up[0], up[1], up[2] );
	camera.lookAt( new THREE.Vector3(target[0], target[1], target[2]) );
	camera.zoom = zoom;
	
	if (gameState.original === undefined) gameState.original = {};
	gameState.original.camera = { eye:position, center:target, vup:up };
	
	engine.cameras.push(camera);
	
	return camera;
}

function parsePerspectiveCamera(jsonNode)
{
	debug("parsePerspectiveCamera\n");

	// Start with default values
	var near = 0.1;
	var far = 2000;
	var aspect = engine.canvas.width / engine.canvas.height;
	var fov = 50.0;

	// Replace with data from jsonNode
	if ("near"   in jsonNode) near   = jsonNode["near"];
	if ("far"    in jsonNode) far    = jsonNode["far"];
	if ("fov"    in jsonNode) fov   = jsonNode["fov"];
	
	// Create and return the camera
	var camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	
	// get other properties
	if ("filmGauge"    in jsonNode) filmGauge   = jsonNode["filmGauge"];
	if ("filmOffset"    in jsonNode) filmOffset   = jsonNode["filmOffset"];
	
	return camera;
}

function parseOrthographicCamera(jsonNode)
{
	debug("parseOrthographicCamera\n");

	// Start with default values
	var near = 0.1;
	var far = 2000;
	var left = engine.canvas.width / -2;
	var right = engine.canvas.width / 2;
	var bottom = engine.canvas.height / -2;
	var top = engine.canvas.height / 2;

	// Replace with data from jsonNode
	if ("near"   in jsonNode) near   = jsonNode["near"];
	if ("far"    in jsonNode) far    = jsonNode["far"];
	
	// Create and return the camera
	var camera = new THREE.OrthographicCamera( left, right, top, bottom, near, far );
	
	return camera;
}

//----------------------------------------------------------------------//
// PARSE A LIGHT
//----------------------------------------------------------------------//

function parseLight(jsonNode)
{
	debug("parseLight");
	
	if (jsonNode === undefined || jsonNode["type"] === undefined) {
		var light = parsePointLight(jsonNode);
	}
	else if (jsonNode["type"] == "ambientLight") {
		var light = parseAmbientLight(jsonNode);
	}
	else if (jsonNode["type"] == "directionalLight") {
		var light = parseDirectionalLight(jsonNode);
	}
	else if (jsonNode["type"] == "hemisphereLight") {
		var light = parseHemisphereLight(jsonNode);
	}
	else if (jsonNode["type"] == "spotLight") {
		var light = parseSpotLight(jsonNode);
	} 
	else {
		// default to pointLight
		var light = parsePointLight(jsonNode);
	}
	
	
	var position = [0, 1.0, 0];
	if ("position" in jsonNode) position = jsonNode["position"];
	if ("target" in jsonNode) light.target = gameState.scene.getObjectByName(jsonNode["target"]);
	
	light.position.set(position[0], position[1], position[2]);
	
	return light;
}

/// This light globally illuminates all objects in the scene equally
function parseAmbientLight(jsonNode)
{
	debug("parseAmbientLight");
	
	// Start with default values
	var colorData = [1.0, 1.0, 1.0];
	var intensity = 1;

	// Replace with data from jsonNode
	if ("color" in jsonNode) colorData = jsonNode["color"];
	if ("intensity" in jsonNode) intensity = jsonNode["intensity"];

	// Create the light and return it
	var color;
	if (Array.isArray(colorData)) {
		color = new THREE.Color(colorData[0], colorData[1], colorData[2]);
	} else { // hex color
		color = new THREE.Color(colorData);
	}
	
	// create light and set properties
	var light = new THREE.AmbientLight(color, intensity);
	
	return light;
}

/// A light that gets emitted in a specific direction
function parseDirectionalLight(jsonNode)
{
	debug("parseDirectionalLight\n");

	// Start with default values
	var colorData = [1.0, 1.0, 1.0];
	var intensity = 1.0;
	var castShadow = false;

	// Replace with data from jsonNode
	if ("color"    in jsonNode) colorData    = jsonNode["color"];
	if ("intensity" in jsonNode) intensity = jsonNode["intensity"];
	if ("castShadow" in jsonNode) castShadow = jsonNode["castShadow"];

	// Create the light and return it
	var color;
	if (Array.isArray(colorData)) {
		color = new THREE.Color(colorData[0], colorData[1], colorData[2]);	
	} else { // hex color
		color = new THREE.Color(colorData);	
	}
	
	// create light and set properties
	var light = new THREE.DirectionalLight( color, intensity );
	light.castShadow = castShadow;
	
	return light;
}

/// A light source positioned directly above the scene, with color fading from the sky color to the ground color
function parseHemisphereLight(jsonNode)
{
	debug("parseHemisphereLight\n");
	
	// Start with default values
	var skyColorData = [1.0, 1.0, 1.0];
	var groundColorData = [1.0, 1.0, 1.0];
	var intensity = 1;

	// Replace with data from jsonNode
	if ("color" in jsonNode) skyColorData = jsonNode["color"];
	else if ("skyColor" in jsonNode) skyColorData = jsonNode["skyColor"];
	if ("groundColor" in jsonNode) groundColorData = jsonNode["groundColor"];
	if ("intensity" in jsonNode) intensity = jsonNode["intensity"];

	// Create the light and return it
	var skyColor;
	var groundColor;
	if (Array.isArray(skyColorData)) {
		skyColor = new THREE.Color(skyColorData[0], skyColorData[1], skyColorData[2]);	
	} else { // hex color
		skyColor = new THREE.Color(skyColorData);	
	}
	if (Array.isArray(groundColorData)) {
		groundColor = new THREE.Color(groundColorData[0], groundColorData[1], groundColorData[2]);	
	} else { // hex color
		groundColor = new THREE.Color(groundColorData);	
	}
	
	// create light and set properties
	var light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
	
	return light;
}

/// A light that gets emitted from a single point in all directions
function parsePointLight(jsonNode)
{
	debug("parsePointLight\n");
	
	// Start with default values
	var colorData = [1.0, 1.0, 1.0];
	var intensity = 1;
	var distance = 0;
	var decay = 1;

	// Replace with data from jsonNode
	if ("color" in jsonNode) colorData = jsonNode["color"];
	if ("intensity" in jsonNode) intensity = jsonNode["intensity"];
	if ("distance" in jsonNode) distance = jsonNode["distance"];
	if ("decay" in jsonNode) decay = jsonNode["decay"];

	// Create the light and return it
	var color;
	if (Array.isArray(colorData)) {
		color = new THREE.Color(colorData[0], colorData[1], colorData[2]);	
	} else { // hex color
		color = new THREE.Color(colorData);	
	}
	
	// create light and set properties
	var light = new THREE.PointLight(color, intensity, distance, decay);
	
	if ("power" in jsonNode) light.power = jsonNode["power"];
	
	return light;
}

function parseSpotLight(jsonNode)
{
	debug("parseSpotLight\n");
	
	// Start with default values
	var colorData = [1.0, 1.0, 1.0];
	var intensity = 1;
	var distance = 0;
	var angle = Math.PI/3;
	var penumbra = 0;
	var decay = 1;
	var castShadow = false;

	// Replace with data from jsonNode
	if ("color" in jsonNode) colorData = jsonNode["color"];
	if ("intensity" in jsonNode) intensity = jsonNode["intensity"];
	if ("distance" in jsonNode) distance = jsonNode["distance"];
	if ("angle" in jsonNode) angle = Math.max(jsonNode["angle"], Math.PI/2);
	if ("penumbra" in jsonNode) penumbra = jsonNode["penumbra"];
	if ("decay" in jsonNode) decay = jsonNode["decay"];
	if ("castShadow" in jsonNode) castShadow = jsonNode["castShadow"];

	// Create the light and return it
	var color;
	if (Array.isArray(colorData)) {
		color = new THREE.Color(colorData[0], colorData[1], colorData[2]);	
	} else { // hex color
		color = new THREE.Color(colorData);	
	}
	
	// create light and set properties
	var light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
	
	if (castShadow) {
		light.castShadow = true;
		light.shadow.bias = 0.0001;
	}
	
	return light;
}

//----------------------------------------------------------------------//
// PARSE A MESH
//----------------------------------------------------------------------//

function parseMesh(jsonNode)
{
	debug("parseMesh\n");

	// Get the material
	var material = parseMaterial(jsonNode["material"]);
	
	// Create the mesh geometry
	var geometry = parseGeometry(jsonNode);
	
	var mesh = createMesh(jsonNode, geometry, material);
	
	return mesh;
}

function createMesh(jsonNode, geometry, material) 
{
	// Create the mesh and return it
	var rotation = jsonNode["rotation"] || [0, 0, 0];
	var position = jsonNode["position"] || [0, 0, 0];
	
	if (material instanceof THREE.SpriteMaterial) {
		var mesh = new THREE.Sprite( material );
	} else if (material instanceof THREE.PointsMaterial) {
        var mesh = new THREE.Points(geometry, material);
        mesh.sortParticles = true;
	} else {
		var mesh = new THREE.Mesh( geometry, material );
	}
	
	mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
	mesh.position.set(position[0], position[1], position[2]);
	
	mesh.castShadow = jsonNode["castShadow"] || false;
	mesh.receiveShadow = jsonNode["receiveShadow"] || false;
	
	return mesh;
}

//----------------------------------------------------------------------//
// PARSE TEXT - ASYNCHRONOUSLY LOADS THE TEXT
//----------------------------------------------------------------------//

/// Asynchronously loads 3D text
/// Data arguments:
/// bevelEnabled
/// bevelThickness
/// bevelSize
/// bevelSegments
/// curveSegments
/// font
/// height
/// position
/// rotation
/// size
function parseText(jsonNode, parentSceneNode)
{
	var material = parseMaterial(jsonNode["material"]);

    var fontName = jsonNode["font"] || "helvetiker_regular";
    var fontURL = "../threejs/examples/fonts/" + fontName + ".typeface.json";

    fontloader.load( 
        fontURL, 
        function ( font ) {
            var geometry = new THREE.TextGeometry( 
				jsonNode["text"] || "",
				{
					font: font,
					size: jsonNode["size"] || 100,
					height: jsonNode["height"] || 50,
					curveSegments: jsonNode["curveSegments"] || 12,
					bevelEnabled: jsonNode["bevelEnabled"] || false,
					bevelThickness: jsonNode["bevelThickness"] || 10,
					bevelSize: jsonNode["bevelSize"] || 8,
					bevelSegments: jsonNode["bevelSegments"] || 3,
				} 
			);
            geometry.computeBoundingBox();

            // centering
            var min = geometry.boundingBox.min;
            var max = geometry.boundingBox.max;
            geometry.translate(
                -(min.x+max.x)*0.5,
                -(min.y+max.y)*0.5,
                -(min.z+max.z)*0.5
            );
            geometry.computeBoundingBox();

            var fontMesh = createMesh(jsonNode, geometry, material);
            
            parentSceneNode.add(fontMesh);
            parseSceneNode(jsonNode, fontMesh);
        } 
    );
}

//----------------------------------------------------------------------//
// PARSE A MATERIAL
//----------------------------------------------------------------------//

function parseMaterial(jsonNode)
{
	debug("parseMaterial\n");
	
	if (jsonNode === undefined || jsonNode["type"] === undefined) {
		return new THREE.MeshLambertMaterial();
	}
	
	var type = jsonNode["type"];
	
	// initialize material
	if (type == "meshPhongMaterial") {
		// Phong material
		var material = new THREE.MeshPhongMaterial();
	} else if (type == "meshBasicMaterial") {
		// Basic (unlit) material
		var material = new THREE.MeshBasicMaterial();
	} else if (type == "sprite" || type == "spriteMaterial") {
		// Sprite object
		var material = new THREE.SpriteMaterial();
	} else if (type == "pointsMaterial") {
		var material = new THREE.PointsMaterial();
	} else {
		// Lambertian material
		var material = new THREE.MeshLambertMaterial();
	}
	
	// get generic material properties
	if ("alphaTest" in jsonNode) {
		material.alphaTest = jsonNode["alphaTest"];
	}
	if ("blendDst" in jsonNode) {
		material.blendDst = jsonNode["blendDst"];
	}
	if ("blendDstAlpha" in jsonNode) {
		material.blendDstAlpha = jsonNode["blendDstAlpha"];
	}
	if ("blendEquation" in jsonNode) {
		material.blendEquation = jsonNode["blendEquation"];
	}
	if ("blendEquationAlpha" in jsonNode) {
		material.blendEquationAlpha = jsonNode["blendEquationAlpha"];
	}
	if ("blending" in jsonNode) {
		material.blendEquationAlpha = jsonNode["blendEquationAlpha"];
	}
	if ("blendSrc" in jsonNode) {
		material.blendEquationAlpha = jsonNode["blendEquationAlpha"];
	}
	if ("blendSrcAlpha" in jsonNode) {
		material.blendEquationAlpha = jsonNode["blendEquationAlpha"];
	}
	if ("clipIntersection" in jsonNode) {
		material.clipIntersection = jsonNode["clipIntersection"];
	}
	if ("clippingPlanes" in jsonNode) {
		//material.clippingPlanes = jsonNode["clippingPlanes"]; // not implemented
	}
	if ("clipShadows" in jsonNode) {
		material.clipShadows = jsonNode["clipShadows"];
	}
	if ("colorWrite" in jsonNode) {
		material.colorWrite = jsonNode["colorWrite"];
	}
	if ("customDepthMaterial" in jsonNode) {
		material.customDepthMaterial = parseMaterial(jsonNode["customDepthMaterial"]);
	}
	if ("customDistanceMaterial" in jsonNode) {
		material.customDistanceMaterial = parseMaterial(jsonNode["customDistanceMaterial"]);
	}
	if ("defines" in jsonNode) {
		material.defines = jsonNode["defines"];
	}
	if ("depthFunc" in jsonNode) {
		material.depthFunc = jsonNode["depthFunc"];
	}
	if ("depthTest" in jsonNode) {
		material.depthTest = jsonNode["depthTest"];
	}
	if ("depthWrite" in jsonNode) {
		material.depthWrite = jsonNode["depthWrite"];
	}
	if ("fog" in jsonNode) {
		material.fog = jsonNode["fog"];
	}
	if ("lights" in jsonNode) {
		material.lights = jsonNode["lights"];
	}
	if ("name" in jsonNode) {
		material.name = jsonNode["name"];
	}
	if ("opacity" in jsonNode) {
		material.opacity = jsonNode["opacity"];
	}
	if ("overdraw" in jsonNode) {
		material.overdraw = jsonNode["overdraw"];
	}
	if ("polygonOffset" in jsonNode) {
		material.polygonOffset = jsonNode["polygonOffset"];
	}
	if ("polygonOffsetFactor" in jsonNode) {
		material.polygonOffsetFactor = jsonNode["polygonOffsetFactor"];
	}
	if ("polygonOffsetUnits" in jsonNode) {
		material.polygonOffsetUnits = jsonNode["polygonOffsetUnits"];
	}
	if ("precision" in jsonNode) {
		material.precision = jsonNode["precision"];
	}
	if ("premultipliedAlpha" in jsonNode) {
		material.premultipliedAlpha = jsonNode["premultipliedAlpha"];
	}
	if ("dithering" in jsonNode) {
		material.dithering = jsonNode["dithering"];
	}
	if ("flatShading" in jsonNode) {
		material.flatShading = jsonNode["flatShading"];
	}
	if ("side" in jsonNode) {
		switch(jsonNode["side"]) {
			case "back": material.side = THREE.BackSide; break;
			case "both": material.side = THREE.DoubleSide; break;
			default: material.side = THREE.FrontSide; break;
		}
	}
	if ("transparent" in jsonNode) {
		material.transparent = jsonNode["transparent"];
	}
	if ("vertexColors" in jsonNode) {
		material.vertexColors = jsonNode["vertexColors"];
	}
	if ("visible" in jsonNode) {
		material.visible = jsonNode["visible"];
	}
	
	// get other material properties
	if ("alphaMap" in jsonNode) {
		material.alphaMap = parseTexture( jsonNode["alphaMap"] );
	}
	if ("aoMap" in jsonNode) {
		material.aoMap = parseTexture( jsonNode["aoMap"] );
	}
	if ("aoMapIntensity" in jsonNode) {
		material.aoMapIntensity = jsonNode["aoMapIntensity"];
	}
	if ("bumpMap" in jsonNode) {
		material.bumpMap = parseTexture( jsonNode["bumpMap"] );
	}
	if ("bumpScale" in jsonNode) {
		material.bumpScale = jsonNode["bumpScale"];
	}
	if ("color" in jsonNode) {
		var d = jsonNode["color"];
		if (Array.isArray(d)) {
			material.color = new THREE.Color(d[0], d[1], d[2]);
		} else {
			material.color = new THREE.Color(d);
		}
	}
	if ("combine" in jsonNode) {
		material.combine = jsonNode["combine"];
	}
	if ("diffuseColor" in jsonNode) {
		var d = jsonNode["diffuseColor"];
		if (Array.isArray(d)) {
			material.color = new THREE.Color(d[0], d[1], d[2]);
		} else {
			material.color = new THREE.Color(d);
		}
	}
	if ("diffuseMap" in jsonNode) {
		material.map = parseTexture( jsonNode["diffuseMap"] );
	}
	if ("displacementMap" in jsonNode) {
		material.displacementMap = parseTexture( jsonNode["displacementMap"] );
	}
	if ("displacementScale" in jsonNode) {
		material.displacementScale = jsonNode["displacementScale"];
	}
	if ("displacementBias" in jsonNode) {
		material.displacementBias = jsonNode["displacementBias"];
	}
	if ("emissive" in jsonNode) {
		var d = jsonNode["diffuseColor"];
		if (Array.isArray(d)) {
			material.emissive = new THREE.Color(d[0], d[1], d[2]);
		} else {
			material.emissive = new THREE.Color(d);
		}
	}
	if ("emissiveMap" in jsonNode) {
		material.emissiveMap = parseTexture( jsonNode["emissiveMap"] );
	}
	if ("emissiveIntensity" in jsonNode) {
		material.emissiveIntensity = jsonNode["emissiveIntensity"];
	}
	if ("envMap" in jsonNode) {
		//material.envMap = parseTexture( jsonNode["envMap"] ); //not implemented
	}
	if ("lightMap" in jsonNode) {
		material.lightMap = parseTexture( jsonNode["lightMap"] );
	}
	if ("map" in jsonNode) {
		material.map = parseTexture( jsonNode["map"] );
	}
	if ("morphtargets" in jsonNode) {
		material.morphtargets = jsonNode["morphtargets"];
	}
	if ("normalMap" in jsonNode) {
		material.normalMap = parseTexture( jsonNode["normalMap"] );
	}
	if ("normalScale" in jsonNode) {
		//material.normalScale = jsonNode["normalScale"]; //not implemented
	}
	if ("reflectivity" in jsonNode) {
		material.reflectivity = jsonNode["reflectivity"];
	}
	if ("refractionRatio" in jsonNode) {
		material.refractionRatio = jsonNode["refractionRatio"];
	}
	if ("shininess" in jsonNode) {
		material.shininess = jsonNode["shininess"];
	}
	if ("skinning" in jsonNode) {
		material.skinning = jsonNode["skinning"];
	}
	if ("specular" in jsonNode) {
		var c = jsonNode["specular"];
		if (Array.isArray(c)) {
			material.specular = new THREE.Color(c[0], c[1], c[2]);
		} else {
			material.specular = new THREE.Color(c);
		}
	}
	if ("specularMap" in jsonNode) {
		material.specularMap = parseTexture( jsonNode["specularMap"] );
	}
	if ("wireframe" in jsonNode) {
		material.wireframe = jsonNode["wireframe"];
	}
	if ("wireframeLinecap" in jsonNode) {
		material.wireframeLinecap = jsonNode["wireframeLinecap"];
	}
	if ("wireframeLinejoin" in jsonNode) {
		material.wireframeLinejoin = jsonNode["wireframeLinejoin"];
	}
	if ("wireframeLinewidth" in jsonNode) {
		material.wireframeLinewidth = jsonNode["wireframeLinewidth"];
	}

	return material;
}

//----------------------------------------------------------------------//
// PARSE A GEOMETRY
//----------------------------------------------------------------------//

function parseGeometry(jsonNode) 
{
	if (jsonNode === undefined || jsonNode["geometry"] === undefined) {
		// return a sphere as the default geometry
		return new THREE.SphereGeometry(1, 8, 6);
	}
	var geometryType = jsonNode["geometry"];
	
	if (geometryType == "cube") {
		var width = jsonNode["width"] || 2;
		var height = jsonNode["height"] || 2;
		var depth = jsonNode["depth"] || 2; 
		var geometry = new THREE.BoxGeometry(width, height, depth);
	}
	else if (geometryType == "plane") {
		var width = jsonNode["width"] || 10;
		var height = jsonNode["height"] || 10;
		var geometry = new THREE.PlaneBufferGeometry(width, height);
	}
	else if (geometryType == "cylinder") {
		var radiusTop = jsonNode["radiusTop"] || 20;
		var radiusBottom = jsonNode["radiusBottom"] || 20;
		var height = jsonNode["height"] || 100;
		var radiusSegments = jsonNode["radiusSegments"] || 8;
		var heightSegments = jsonNode["heightSegments"] || 1;
		var openEnded = jsonNode["openEnded"] || false;
		var thetaStart = jsonNode["thetaStart"] || 0;
		var thetaLength = jsonNode["thetaLength"] || 2 * Math.PI;
		var geometry = new THREE.CylinderGeometry(
			radiusTop, 
			radiusBottom, 
			height, 
			radiusSegments, 
			heightSegments, 
			openEnded, 
			thetaStart, 
			thetaLength
		);
	}
	else if (geometryType == "torus") {
		var radius = jsonNode["radius"] || 100;
		var tube = jsonNode["tube"] || 40;
		var radialSegments = jsonNode["radialSegments"] || 8;
		var tubularSegments = jsonNode["tubularSegments"] || 6;
		var arc = jsonNode["arc"] || 2 * Math.PI;
		var geometry = new THREE.TorusGeometry(
			radius, 
			tube,
			radialSegments,
			tubularSegments,
			arc
		);
	}
	else if (geometryType == "ring") {
		var innerRadius = jsonNode["innerRadius"] || 0.5;
		var outerRadius = jsonNode["outerRadius"] || 1;
		var thetaSegments = jsonNode["thetaSegments"] || 8;
		var phiSegments = jsonNode["phiSegments"] || 8;
		var thetaStart = jsonNode["thetaStart"] || 0;
		var thetaLength = jsonNode["thetaLength"] || Math.PI * 2;
		var geometry = new THREE.RingGeometry(
			innerRadius,
			outerRadius,
			thetaSegments,
			phiSegments,
			thetaStart,
			thetaLength
		);
	}
	else { // (geometryType == "sphere") 
		var radius = jsonNode["radius"] || 1;
		var widthSegments = jsonNode["widthSegments"] || 8;
		var heightSegments = jsonNode["heightSegments"] || 6;
		var geometry = new THREE.SphereGeometry(
			radius, 
			heightSegments, 
			widthSegments
		);
	}
	
	return geometry;
}

//----------------------------------------------------------------------//
// PARSE A TEXTURE MAP - ASYNCHRONOUSLY LOADS THE TEXTURE IMAGE
//----------------------------------------------------------------------//

function parseTexture(textureURL)
{
	debug("parseTexture: " + textureURL);

	var texture = new THREE.Texture;

	/*
	// textureURL is the id of an img element 
	if (document.getElementById(textureURL))
	{
		var imageElement = document.getElementById(textureURL);
		texture.image = imageElement;
		texture.needsUpdate = true;
		return texture;
	}
	*/

	// Otherwise, assume textureURL is an image name
	imageloader.load( 
		textureURL, 
		function(image) { // callback function
			texture.image = image;
			texture.needsUpdate = true;
		} 
	);
	return texture;
}

//----------------------------------------------------------------------//
// PARSE AN OBJ FILE - ASYNCHRONOUSLY LOADS THE FILE
//----------------------------------------------------------------------//

function parseObjFile(jsonNode, parentSceneNode)
{
	debug("parseObjFile");
	
	if ("material" in jsonNode && jsonNode["material"]["type"] == "matFile") {
		// asynchronously load material and object
		var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				debug( Math.round(percentComplete, 2) + '% downloaded' );
			}
		};

		var onError = function ( xhr ) { };
				
		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.setPath( "./" );
		mtlLoader.load( jsonNode["material"]["url"], function( materials ) {

			materials.preload();

			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials( materials );
			objLoader.setPath( "./" );
			objLoader.load( jsonNode["url"], function ( object ) {

				parentSceneNode.add(object);
				parseSceneNode(jsonNode, object);

			}, onProgress, onError );

		});
		
		return;
	} 
	
	var material = parseMaterial(jsonNode["material"]);
	var modelURL = jsonNode["url"];

	// Callbacks for different aspects of loading
	var onLoad = function(mesh) {
		mesh.traverse(onTraverse);
		parentSceneNode.add(mesh);
		parseSceneNode(jsonNode, mesh);
	}
	var onTraverse = function (child) {
		if (child instanceof THREE.Mesh) {
			child.material = material;
		}
	};
	var onProgress = function (x) {
		// nothing
	};
	var onError = function (x) { 
		debug("Error! could not load " + modelURL);
	};

	// Load the model using the callbacks previously defined
	var loader = new THREE.OBJLoader(loadingManager);
	loader.load(modelURL, onLoad, onProgress, onError);
}

//----------------------------------------------------------------------//
// PARSE A SOUND FILE
//----------------------------------------------------------------------//

/// Adds a sound. 
/// Note you must provide both a "url" and "name" for the sound.
function parseSound(jsonNode, parentSceneNode)
{
	debug("parseSound");
	
	var audio = null;
	
	if (jsonNode["url"]) {
		audio = new Audio(jsonNode["url"]);
		
		var startPlaying = false;
		if (jsonNode["loop"]) audio.loop = jsonNode["loop"];
		if (jsonNode["preload"]) audio.preload = jsonNode["preload"];
		if (jsonNode["autoplay"]) startPlaying = jsonNode["autoplay"];
		audio.autoplay = startPlaying;
		
		// add the audio to the engine sounds
		if (jsonNode["name"]) 
			engine.sounds[jsonNode["name"]] = audio;
	}
}

//----------------------------------------------------------------------//
// ADD A SCRIPT TO THE RUNNING PAGE FROM AN EXTERNAL URL
//----------------------------------------------------------------------//

function loadScript(scriptURL)
{
	debug("loadScript " + scriptURL);
    
    // Create an element for the script
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = scriptURL;

    // Add the script element to the head of the page
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(script);
}

//----------------------------------------------------------------------//
// THE MAIN FUNCTION OF THE GAME (ANIMATION) LOOP
//----------------------------------------------------------------------//

function startGameLoop() 
{
	requestAnimationFrame(startGameLoop);	// schedules another call to animate
	animateFrame();					// updates the scene for the frame
	render();						// draws the scene
}

//----------------------------------------------------------------------//
// CONTROLS ANIMATING A SINGLE FRAME
//----------------------------------------------------------------------//

function animateFrame()
{
	// Update the time
	var t = getElapsedTime();
	engine.frameDuration = t - engine.frameStartTime;
	engine.frameStartTime = t;
	engine.frameNum++;
	
	// Update the current camera and scene
	if (gameState.camera !== undefined) gameState.camera.updateProjectionMatrix();
	if (gameState.scene  !== undefined) gameState.scene.traverse(runScripts);

	// Update previous mouse and touch states here because animateFrame 
	// out of sync with listeners 
	engine.mousePrevX = engine.mouseX;
	engine.mousePrevY = engine.mouseY;
	engine.mousePrevScroll =  engine.mouseScroll;
	//
	engine.touchPrevX = engine.touchX;
	engine.touchPrevY = engine.touchY;
}

//----------------------------------------------------------------------//
// CALLBACK TO RUN ALL THE SCRIPTS FOR A GIVEN sceneNode
//----------------------------------------------------------------------//

function runScripts(sceneNode)
{
	var scripts = sceneNode.userData.scripts;
	if (scripts === undefined) return;

	for (var i=0; i<scripts.length; i++) {
		var f = window[scripts[i]]; // look up function by name
		if (f !== undefined) f(sceneNode);
	}
}

//----------------------------------------------------------------------//
// RENDER CURRENT SCENE WITH CURRENT RENDERER USING CURRENT CAMERA
//----------------------------------------------------------------------//

function render() 
{
	var gs = gameState;
	if (gs.scene && gs.camera && gs.renderer) {
		gs.renderer.render(gs.scene, gs.camera);
	}
	else {
		var msg = "";
		if (!gs.scene) msg += "no scene. ";
		if (!gs.camera) msg += "no camera. ";
		if (!gs.renderer) msg += "no renderer."
		debug(msg);
	}
}

//----------------------------------------------------------------------//
// CAMERA FUNCTIONS
//----------------------------------------------------------------------//

/// Switch cameras
function switchCamera(id)
{
	var camera;
	
	if (isNaN(id)) {
		// id is the name of the camera
		camera = gameState.scene.getObjectByName( id, true );
	} else if (id < engine.cameras.length) {
		// id is the array index of the camera
		camera = engine.cameras[id];
	}
	
	if (camera !== undefined && camera.isCamera) {
		gameState.camera = camera;
	}
}

/// Translate the camera
function translateCamera(vector)
{
	gameState.camera.position.x += vector.x;
	gameState.camera.position.y += vector.y;
	gameState.camera.position.z += vector.z;
}

/// Rotate the camera 
function rotateCamera(vector)
{
	gameState.camera.rotation.x += vector.x;
	gameState.camera.rotation.y += vector.y;
	gameState.camera.rotation.z += vector.z;
}

/// Reset the camera to its original view
function resetCamera()
{
	var origin = gameState.original.camera;
	
	var eye = origin.eye;
	gameState.camera.position.set( eye[0], eye[1], eye[2] );
	
	var center = origin.center;
	gameState.camera.lookAt( new THREE.Vector3(center[0], center[1], center[2]) );
	
	var vup = origin.vup;
	gameState.camera.up.set( vup[0], vup[1], vup[2] );
	
	debug('Camera reset.');
}

//----------------------------------------------------------------------//
// COLLISION
//----------------------------------------------------------------------//


/// Checks the collisions for object
/// @return a Set of objects that collide with object
/// Source: https://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
///			https://stackoverflow.com/questions/29688618/raycaster-intersectobjects-does-not-work-gives-the-empty-array-using-three-js
function getCollisions(object)
{
	var collidedObjects = new Set();
	for (var vertexIndex = 0; vertexIndex < object.geometry.vertices.length; vertexIndex++)
	{
		// get a ray to each vertex on the sphere
		var directionVector = object.geometry.vertices[vertexIndex].clone();
		var farDistance = directionVector.length();
		var raycaster = new THREE.Raycaster( object.position, directionVector.normalize(), 0, farDistance );
		
		// Get collision results
		var collisionResults = raycaster.intersectObjects( gameState.scene.children );
		var indexToRemove = collisionResults.indexOf(object);
		if (indexToRemove > -1) {
			collisionResults.splice(indexToRemove, 1);
		}
		collisionResults.forEach( function(collidedObject) {
			collidedObjects.add(collidedObject);
		});
	}
	return collidedObjects;
}

/// Checks the collisions for an object made up of many children, each 
/// of whom have their own geometries and materials (such as an object
/// created in Blendr)
/// @return a Set of objects that (roughly) collide with object
/// Currently this is more granular than I'd like, but it's the best
/// I can do right now.
function getCollisionsForComplexObject(object)
{
	var raycaster = new THREE.Raycaster();
	var collidedObjects = new Set();
	var origin = object.position;
	
	for (var i = 0; i < object.children.length; i++)
	{
		if (!object.children[i].geometry ||
			!object.children[i].geometry.boundingSphere) continue;
		// get a ray to each vertex on the sphere
		var directionVector = object.children[i].geometry.boundingSphere.center.clone();
		raycaster.set( origin, directionVector );
		
		// Get collision results
		var collisionResults = raycaster.intersectObjects( gameState.scene.children );
		collisionResults.forEach( function(collidedObject) {
			collidedObjects.add(collidedObject);
		});
	}
	return collidedObjects;
}

//----------------------------------------------------------------------//
// MOVMEMENT 
//----------------------------------------------------------------------//

function getForwardDirection(object)
{
	return new THREE.Vector3(0, 0, -1).applyQuaternion(object.quaternion);
}

function getRightDirection(object)
{
	return new THREE.Vector3(1, 0, 0).applyQuaternion(object.quaternion);
}

function rotateAroundWorldAxis(object, axis, radians) 
{
	// axis must be normalized, angle in radians
	// Also, assuming that the parents of object have no rotation

    var q = new THREE.Quaternion(); 
    q.setFromAxisAngle( axis, radians ); 
    object.quaternion.premultiply( q );
}

//----------------------------------------------------------------------//
