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
	SPACE_BAR: 32,
	UP_ARROW: 38,
	DOWN_ARROW: 40,
	LEFT_ARROW: 37,
	RIGHT_ARROW: 39,
	NUMPAD_1: 97,
	NUMPAD_2: 98,
	NUMPAD_3: 99,
	NUMPAD_4: 100,
	NUMPAD_5: 101,
	NUMPAD_6: 102,
	NUMPAD_7: 103,
	NUMPAD_8: 104,
	NUMPAD_9: 105,
	TERMINAL_VELOCITY: 20,
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

	rendererContainer: undefined,   // A div element that will hold the renderer
	canvas: undefined,				// The game canvas
	loadingManager: undefined,		// loading manager for loading assets

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

	compassHeading: 0   // compass heading (0 = north)
};

//--------------- THE CURRENT GAME STATE

var gameState = {
	scene: undefined,     
	camera: undefined,
	renderer: undefined,
	original: undefined,
	objectsPlayerCollidedWith: new Set(),
	lights: [],
};

//----------------------------------------------------------------------//
// PERFORM GENERAL INITIALIZATION. CREATE THE RENDERER AND LOADING
// MANAGER, AND START LISTENING TO GUI EVENTS.
//----------------------------------------------------------------------//

function initEngineFullScreen()
{
	debug("initEngineFullScreen()");

	// Create a div element and the canvas
	var container = document.createElement("div");
	var canvas = document.createElement("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	engine.fullScreen = true;
	document.body.appendChild(container);
	container.appendChild(canvas);

	initEngine(canvas);
}

//----------------------------------------------------------------------//

function initEngine(canvas) 
{
	debug("initEngine");

	// reset start time
	engine.startTime = (new Date()).getTime() * 0.001; 
	engine.frameStartTime = 0;
	engine.frameNum = 0;
	engine.frameDuration = 1.0/60.0;
	engine.canvas = canvas;

	// Make the loading manager for Three.js.
	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function (item, loaded, total) { };

	// Create renderer and add it to the container (div element)
	var renderer = new THREE.WebGLRenderer( {antialias:true, canvas:canvas} );
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(canvas.width, canvas.height);
	renderer.shadowMap.enabled	= true;
	renderer.shadowMap.type		= THREE.PCFSoftShadowMap;
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
    window.addEventListener( "keydown", gOnKeyDown );
    window.addEventListener( "keyup", gOnKeyUp );
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
	if (gameState.onClick) gameState.onClick(event);
}

function gOnMouseUp(event) 
{
	debug("onMouseUp\n");
	engine.mouseDown = 0;
	if (gameState.onMouseUp) gameState.onMouseUp(event);
}	

function gOnMouseDown(event) 
{
	debug("onMouseDown " + event.which + "\n");
	engine.mouseDown = event.which;
	if (gameState.onMouseDown) gameState.onMouseDown(event);
}	

function gOnMouseMove(event) 
{
	//debug("onMouseMove " + event.clientX + "," + event.clientY + "\n");
	
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

	if (event.detail > 0 || event.detail < 0) {
		engine.mouseScroll += event.detail/120.0;
	}
	if (event.wheelDelta > 0 || event.wheelDelta < 0) {
		engine.mouseScroll += event.wheelDelta/120.0;
	}

	if (gameState.onMouseWheel) gameState.onMouseWheel(event);
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
	if (key == 192) {
		// tilde
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
function addDebugInfo(message, textIterable)
{
	if (engine.DEBUG && engine.canvas !== undefined)
	{
		var element = document.getElementById("debug");
		if (element === undefined) return;

		// add debug text
		engine.debugText += message;
		if (textIterable !== undefined) {
			textIterable.forEach( function (textValue) {
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
	debug("parseScene\n");

	var scene = new THREE.Scene();
	gameState.scene = scene;
	scene.background = new THREE.Color().setHSL( 0.6, 0.6, 0.8 );
	parseSceneNode(jsonParseTree, scene);
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
		var audio = new Audio(jsonNode["backgroundMusic"]);
		debug("playing " + jsonNode["backgroundMusic"]);
		audio.play();
	}

	// The name of the node (useful to look up later in a script)
	if ("name" in jsonNode) {
		sceneNode["name"] = jsonNode["name"];
	}

	// Whether the node starts out as visible.
	if ("visible" in jsonNode) {
		sceneNode.setVisible(jsonNode["visible"]);
	}

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
			
			if (childType == "node") { // empty object to hold a transform
				var childSceneNode = new THREE.Object3D();
				sceneNode.add(childSceneNode);
				parseSceneNode(childJsonNode, childSceneNode);
			}
			if (childType == "perspectiveCamera") {
				var camera = parsePerspectiveCamera(childJsonNode);
				sceneNode.add(camera);
				if (gameState.camera === undefined) gameState.camera = camera;
				parseSceneNode(childJsonNode, camera);
			}
			else if (childType == "ambientLight") {
				var light = parseAmbientLight(childJsonNode);
				sceneNode.add(light);
				parseSceneNode(childJsonNode, light);
			}
			else if (childType == "directionalLight") {
				var light = parseDirectionalLight(childJsonNode);
				sceneNode.add(light);
				parseSceneNode(childJsonNode, light);
			}
			else if (childType == "hemisphereLight") {
				var light = parseHemisphereLight(childJsonNode);
				sceneNode.add(light);
				parseSceneNode(childJsonNode, light);
			}
			else if (childType == "pointLight") {
				var light = parsePointLight(childJsonNode);
				sceneNode.add(light);
				parseSceneNode(childJsonNode, light);
			}
			else if (childType == "spotLight") {
				var light = parseSpotLight(childJsonNode);
				sceneNode.add(light);
				parseSceneNode(childJsonNode, light);
			}
			else if (childType == "mesh") {
				var mesh = parseMesh(childJsonNode);
				sceneNode.add(mesh);
				parseSceneNode(childJsonNode, mesh);
			}
			else if (childType == "ground") {
				var plane = parsePlaneBufferGeometry(childJsonNode);
				sceneNode.add(plane);
				parseSceneNode(childJsonNode, plane);
			}
		}
	}	
}

//----------------------------------------------------------------------//
// PARSE A TRANSFORM
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

function parsePerspectiveCamera(jsonNode)
{
	debug("parsePerspectiveCamera\n");

	// Start with default values
	var near = 0.2;
	var far = 10000.0;
	var aspect = engine.canvas.width / engine.canvas.height;
	var fovy = 60.0;
	var eye = [0.0, 0.0, 100.0];
	var vup = [0.0, 1.0, 0.0];
	var center = [0.0, 0.0, 0.0];

	// Replace with data from jsonNode
	if ("near"   in jsonNode) near   = jsonNode["near"];
	if ("far"    in jsonNode) far    = jsonNode["far"];
	if ("fov"    in jsonNode) fovy   = jsonNode["fov"];
	if ("eye"    in jsonNode) eye    = jsonNode["eye"];
	if ("vup"    in jsonNode) vup    = jsonNode["vup"];
	if ("center" in jsonNode) center = jsonNode["center"];
	
	if (gameState.original === undefined) gameState.original = {};
	gameState.original.camera = { eye:eye, center:center, vup:vup };
	
	// Create and return the camera
	var camera = new THREE.PerspectiveCamera( fovy, aspect, near, far );
	camera.position.set( eye[0], eye[1], eye[2] );
	camera.up.set( vup[0], vup[1], vup[2] );
	camera.lookAt( new THREE.Vector3(center[0], center[1], center[2]) );
	
	return camera;
}

//----------------------------------------------------------------------//
// PARSE A LIGHT
//----------------------------------------------------------------------//

function parseAmbientLight(jsonNode)
{
	debug("parseAmbientLight");
	
	// Start with default values
	var colorData = [1.0, 1.0, 1.0];
	var position = [1.0, 1.0, 1.0];
	var intensity = 1;

	// Replace with data from jsonNode
	if ("color" in jsonNode) colorData = jsonNode["color"];
	if ("intensity" in jsonNode) intensity = jsonNode["intensity"];
	if ("position" in jsonNode) position = jsonNode["position"];

	// Create the light and return it
	var color;
	if (Array.isArray(colorData)) {
		color = new THREE.Color(colorData[0], colorData[1], colorData[2]);	
	} else { // hex color
		color = new THREE.Color(colorData);	
	}
	
	// create light and set properties
	var light = new THREE.AmbientLight(color, intensity);
	light.position.set(position[0], position[1], position[2]);
	gameState.lights.push(light);
	
	return light;
}

function parseDirectionalLight(jsonNode)
{
	debug("parseDirectionalLight\n");

	// Start with default values
	var colorData = [1.0, 1.0, 1.0];
	var position = [1.0, 1.0, 1.0];
	var intensity = 1.0;
	var castShadow = false;

	// Replace with data from jsonNode
	if ("color"    in jsonNode) colorData    = jsonNode["color"];
	if ("position" in jsonNode) position = jsonNode["position"];
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
	light.position.set( position[0], position[1], position[2] );
	light.castShadow = castShadow;
	gameState.lights.push(light);
	
	return light;
}

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
	gameState.lights.push(light);
	
	return light;
}

function parsePointLight(jsonNode)
{
	debug("parsePointLight\n");
	
	// Start with default values
	var colorData = [1.0, 1.0, 1.0];
	var position = [1.0, 1.0, 1.0];
	var intensity = 1;
	var distance = 0;
	var decay = 1;

	// Replace with data from jsonNode
	if ("color" in jsonNode) colorData = jsonNode["color"];
	if ("position" in jsonNode) position = jsonNode["position"];
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
	light.position.set(position[0], position[1], position[2]);
	gameState.lights.push(light);
	
	return light;
}

function parseSpotLight(jsonNode)
{
	debug("parseSpotLight\n");
	
	// Start with default values
	var colorData = [1.0, 1.0, 1.0];
	var position = [1.0, 1.0, 1.0];
	var intensity = 1;
	var distance = 0;
	var angle = Math.PI/3;
	var penumbra = 0;
	var decay = 1;
	var castShadow = false;

	// Replace with data from jsonNode
	if ("color" in jsonNode) colorData = jsonNode["color"];
	if ("position" in jsonNode) position = jsonNode["position"];
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
	light.position.set(position[0], position[1], position[2]);
	
	if (castShadow) {
		light.castShadow = true;
		light.shadow.bias = 0.0001;
	}
	
	if ("target" in jsonNode) light.target = gameState.scene.getObjectByName(jsonNode["target"]);
	
	gameState.lights.push(light);
	
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
	var geometryType = jsonNode["geometry"];
	var geometry;
	var rotation = [0, 0, 0];
	var position = [0, 0, 0];
	if ("rotation" in jsonNode) rotation = jsonNode["rotation"];
	if ("position" in jsonNode) position = jsonNode["position"];

	if (geometryType == "cube") {
		var width = 2;
		var height = 2;
		var depth = 2;
		if ("width"  in jsonNode) width  = jsonNode["width"];
		if ("height" in jsonNode) height = jsonNode["height"];
		if ("depth"  in jsonNode) depth  = jsonNode["depth"]; 
		geometry = new THREE.BoxGeometry(width, height, depth);
	}
	else { // (geometryType == "sphere") 
		var radius = 1;
		var widthSegments = 8;
		var heightSegments = 6;
		if ("radius"         in jsonNode) radius         = jsonNode["radius"];       
		if ("widthSegments"  in jsonNode) widthSegments  = jsonNode["widthSegments"];
		if ("heightSegments" in jsonNode) heightSegments = jsonNode["heightSegments"];
		geometry = new THREE.SphereGeometry(radius, heightSegments, widthSegments);
	}
	
	// Create the mesh and return it
	var mesh = new THREE.Mesh( geometry, material );
	mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
	mesh.position.set(position[0], position[1], position[2]);
	mesh.castShadow = true;
	mesh.receiveShadow = false;
	
	return mesh;
}

function parsePlaneBufferGeometry(jsonNode)
{
	debug("parseMesh\n");

	// Create the plane geometry
	var width = 10;
	var height = 10;
	var rotation = [0, 0, 0];
	var position = [0, 0, 0];
	
	if ("width"  in jsonNode) width  = jsonNode["width"];
	if ("height" in jsonNode) height = jsonNode["height"];
	if ("rotation" in jsonNode) rotation = jsonNode["rotation"];
	if ("position" in jsonNode) position = jsonNode["position"];
	
	var geometry = new THREE.PlaneBufferGeometry(width, height);
	
	// Get the material
	var material = parseMaterial(jsonNode["material"]);
	
	// Create the mesh and return it
	var mesh = new THREE.Mesh( geometry, material );
	mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
	mesh.position.set(position[0], position[1], position[2]);
	mesh.castShadow	= true;
	mesh.receiveShadow	= true;
	
	return mesh;
}

//----------------------------------------------------------------------//
// PARSE A MATERIAL
//----------------------------------------------------------------------//

function parseMaterial(jsonNode)
{
	debug("parseMaterial\n");
	
	if (jsonNode === undefined) return new MeshLambertMaterial();
	
	var material;
	var type = jsonNode["type"];
	
	// initialize material
	if (type == "meshPhongMaterial")
	{
		// Phong material
		var material = new THREE.MeshPhongMaterial();
		if ("specular" in jsonNode) {
			var c = jsonNode["specular"];
			if (Array.isArray(c)) {
				material.specular = new THREE.Color(c[0], c[1], c[2]);
			} else {
				material.specular = new THREE.Color(c);
			}
		}
	} else if (type == "meshBasicMaterial") {
		// Basic (unlit) material
		var material = new THREE.MeshBasicMaterial();
	} else {
		// Lambertian material
		var material = new THREE.MeshLambertMaterial();
	}
	
	// get material properties
	if ("side" in jsonNode) {
		switch(jsonNode["side"]) {
			case "back": material.side = THREE.BackSide; break;
			case "both": material.side = THREE.DoubleSide; break;
			default: material.side = THREE.FrontSide; break;
		}
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
	if ("map" in jsonNode) {
		material.map = parseTexture( jsonNode["map"] );
	}

	return material;
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
	var loader = new THREE.ImageLoader(engine.loadingManager);
	loader.load( 
		textureURL, 
		function(image) { // callback function
			texture.image = image;
			texture.needsUpdate = true;
		} 
	);
	return texture;
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

/// Translate the camera
function translateCamera(vector)
{
	gameState.camera.position.x += vector.x;
	gameState.camera.position.y += vector.y;
	gameState.camera.position.z += vector.z;
}

/// Rotate the camera around the center of the map
function rotateCamera(axis, amount)
{
	var camera = gameState.camera;
	var sinAmount = Math.sin(amount * engine.frameDuration);
	var cosAmount = Math.cos(amount * engine.frameDuration);
	var x = camera.position.x;
	var y = camera.position.y;
	var z = camera.position.z;

	camera.position.x = (x * cosAmount + z * sinAmount) * axis.y
					  + (x * cosAmount + z * sinAmount) * axis.z
					  + x * axis.x;
	camera.position.y = (y * cosAmount + x * sinAmount) * axis.z
					  + (y * cosAmount + z * sinAmount) * axis.x
					  + y * axis.y;
	camera.position.z = (z * cosAmount - x * sinAmount) * axis.y
					  + (z * cosAmount - y * sinAmount) * axis.x
					  + z * axis.z;
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


/// Checks for collisions with forObject
/// @return a Set of objects that collide with forObject
/// Source: https://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
///			https://stackoverflow.com/questions/29688618/raycaster-intersectobjects-does-not-work-gives-the-empty-array-using-three-js
function getCollisions(forObject)
{
	var collidedObjects = new Set();
	for (var vertexIndex = 0; vertexIndex < forObject.geometry.vertices.length; vertexIndex++)
	{
		// get a ray to each vertex on the sphere
		var directionVector = forObject.geometry.vertices[vertexIndex].clone();
		var farDistance = directionVector.length();
		var raycaster = new THREE.Raycaster( forObject.position, directionVector.normalize(), 0, farDistance );
		
		// Get collision results
		var collisionResults = raycaster.intersectObjects( gameState.scene.children );
		var indexToRemove = collisionResults.indexOf(forObject);
		if (indexToRemove > -1) {
			collisionResults.splice(indexToRemove, 1);
		}
		collisionResults.forEach( function(object) {
			collidedObjects.add(object);
		});
	}
	return collidedObjects;
}

//----------------------------------------------------------------------//
