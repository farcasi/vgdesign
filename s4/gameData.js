// Arrays for scene children
var level0Children = 
[	
	/// Environment (ground and sky)
	{
		"COMMENT": "GROUND",
		"type": "mesh",
		"geometry": "plane",
		"name": "ground",
		"width": 1000,
		"height": 1000,
		"rotation": [-Math.PI/2, 0, 0],
		"position": [0, 0, 0],
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "groundMat",
			"color": 0x018E0E,
		},
		"receiveShadow": true,
	},
	
	/// Player (car)
	{
		"type": "objFile",
		"name": "car",
		"url": "data/objects/car.obj",
		"material": 
		{
			"type": "matFile",
			"name": "carMaterial",
			"url": "data/objects/car.mtl",
		},
		"userData": 
		{ 
			"scripts": ["moveCarScript", "ringScript", "roadScript"]
		},
		"children":
		[
			/// Cameras
			{
				"COMMENT": "CAMERA LOOKING AT PLAYER FROM BEHIND",
				"type": "perspectiveCamera",
				"name": "camera1",
				"eye": [0, 4, -10], // look from
				"center": [0, 1, 1], // look at
			},
			{
				"COMMENT": "CAMERA LOOKING AT PLAYER FROM CLOSE BEHIND",
				"type": "perspectiveCamera",
				"name": "camera2",
				"eye": [0, 2, -5], // look from
				"center": [0, 1, 1], // look at
			},
			{
				"COMMENT": "CAMERA LOOKING FROM HOOD",
				"type": "perspectiveCamera",
				"name": "camera3",
				"eye": [0, 1.1, 0.6], // look from
				"center": [0, 1, 1], // look at
				"fov": 80,
			},
		],
	},
	
	/// Objects
	{
		"COMMENT": "RACE TRACK",
		"name": "raceTrack",
		"type": "node",
		"children":
		[
			{
				"type": "mesh",
				"geometry": "ring",
				"translate": [45, 0.01, 0],
				"rotation": [-Math.PI/2, 0, 0],
				"innerRadius": 40,
				"outerRadius": 50,
				"thetaSegments": 64,
				"material": 
				{
					"type": "meshLambertMaterial",
					"name": "trackMat",
					"color": 0x7F8076,
				},
				"receiveShadow": true,
			},
			{
				"type": "mesh",
				"geometry": "ring",				
				"translate": [-45, 0.01, 0],
				"rotation": [-Math.PI/2, 0, 0],
				"innerRadius": 40,
				"outerRadius": 50,
				"thetaSegments": 64,
				"material": 
				{
					"type": "meshLambertMaterial",
					"name": "trackMat",
					"color": 0x7F8076,
				},
				"receiveShadow": true,
			},
		],
	},
	{
		"type": "mesh",
		"name": "ring1",
		"translate": [-10, 0, 28],
		"geometry": "torus",
		"rotation": [0, -Math.PI/4.2, 0],
		"radius": 8,
		"tube": 0.6,
		"radialSegments": 16,
		"tubularSegments": 64,
		"material": 
		{
			"type": "meshPhongMaterial",
			"color": 0xffffff,
		},
	},
	{
		"type": "mesh",
		"name": "ring2",
		"translate": [10, 0, 28],
		"geometry": "torus",
		"rotation": [0, Math.PI/4.2, 0],
		"radius": 8,
		"tube": 0.6,
		"radialSegments": 16,
		"tubularSegments": 32,
		"material": 
		{
			"type": "meshPhongMaterial",
			"color": 0xffffff,
		},
	},
	{
		"type": "mesh",
		"name": "ring3",
		"translate": [10, 0, -28],
		"geometry": "torus",
		"rotation": [0, -Math.PI/4.2, 0],
		"radius": 8,
		"tube": 0.6,
		"radialSegments": 16,
		"tubularSegments": 32,
		"material": 
		{
			"type": "meshPhongMaterial",
			"color": 0xffffff,
		},
	},
	{
		"type": "mesh",
		"name": "ring4",
		"translate": [-10, 0, -28],
		"geometry": "torus",
		"rotation": [0, Math.PI/4.2, 0],
		"radius": 8,
		"tube": 0.6,
		"radialSegments": 16,
		"tubularSegments": 32,
		"material": 
		{
			"type": "meshPhongMaterial",
			"color": 0xffffff,
		},
	},
	
	/// Text
	
	/// Lights
	{
		"COMMENT": "Key light",
		"type": "directionalLight",
		"name": "keyLight",
		"color": 0xffffcc,
		"position": [-5, 10, 5],
		"intensity": .6,
	},
	{
		"COMMENT": "Fill light 1",
		"type": "directionalLight",
		"name": "fillLight1",
		"color": 0xccffff,
		"position": [5, -5, 10],
		"intensity": 0.3,
	},
	{
		"COMMENT": "Back light 1",
		"type": "directionalLight",
		"name": "backLight1",
		"color": 0xffffff,
		"position": [0, 0, -10],
		"intensity": 0.3,
	},
	{
		"COMMENT": "White light",
		"type": "hemisphereLight",
		"name": "light",
		"skyColor": [1, 1, 1],
		"groundColor": [0, 0, 0],
	},
	
	/// Sound
	{
		"COMMENT": "Static",
		"type": "sound",
		"name": "static",
		"url": "data/sound/tv-static.mp3",
		"loop": true,
		"preload": true,
	}
];

var level0 = 
{ 
"COMMENT": "Demo Level",
"type": "node",
"name": "rootNode",
"scriptFiles": [ "scripts/sprint4Script.js" ],
"backgroundMusic": "data/sound/bgm/Faster_Than_the_Eye_Can_Perceive.mp3",

"userData":
{
	"scripts": ["sceneControl"]
},

"children": level0Children,
};

