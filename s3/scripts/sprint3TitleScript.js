//----------------------------------------------------------------------//
// CONTROL SCRIPTS 
//----------------------------------------------------------------------//

/// sceneControl is called every frame.
var sceneControl = function(sceneNode)
{
	var camera = gameState.camera;
	
	// rotate camera
	rotateAroundWorldAxis(camera, constants.YAXIS, -(Math.PI/360));
	
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
}

function rotateAroundWorldAxis(object, axis, radians) 
{
    var q = new THREE.Quaternion(); 
    q.setFromAxisAngle( axis, radians ); // axis must be normalized, angle in radians
    object.quaternion.premultiply( q );
}
