// Arrays for scene children
var introStageChildren = 
[
	/// Camera
	
	{
		"COMMENT": "CAMERA LOOKING AT ORIGIN FROM ALONG THE Z AXIS",
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 5, 0], // look from
		"center": [0, 5, 0], // look at
		"vup": [0, 1, 0], // "up" direction
		"children":
		[
			{
				"type": "mesh",
				"name": "playerMesh",
				"geometry": "cylinder",
				"side": "front",
				"translate": [0, -2.5, 0],
				"height": 5,
				"radiusTop": 1,
				"radiusBottom": 1,
				"radiusSegments": 16,
				"material": 
				{
					"type": "meshPhongMaterial",
					"color": 0x00ffff,
				},
			},
		],
	},
	
	/// Environment (ground and sky)
	
	{
		"COMMENT": "GROUND",
		"type": "mesh",
		"geometry": "plane",
		"name": "ground",
		"width": 500,
		"height": 500,
		"rotation": [-Math.PI/2, 0, 0],
		"position": [0, 0, 0],
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "groundMat",
			"color": 0xAA6633,
			"map": "images/dirt.png",
			"bumpMap": "images/dirt.png",
			"bumpScale": 0.2,
			"specular": 0x000000,
		},
	},
	{
		"type": "mesh",
		"name": "wall",
		"translate": [0, 75, -4],
		"geometry": "cylinder",
		"height": 155,
		"radiusTop": 200,
		"radiusBottom": 150,
		"radiusSegments": 16,
		"openEnded": true,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "wallMat",
			"color": 0xAA6633,
			"side": "back",
			"map": "images/dirt.png",
			"bumpMap": "images/dirt.png",
			"bumpScale": 0.2,
			"specular": 0x000000,
		},
	},
	
	/// Player
	
	/// Objects
	
	{
		"type": "mesh",
		"name": "cylinder",
		"translate": [0, 1.5, -4],
		"geometry": "cylinder",
		"rotation": [Math.PI/2, 0, Math.PI/3],
		"height": 5,
		"radiusTop": 1.5,
		"radiusBottom": 1.5,
		"radiusSegments": 16,
		"material": 
		{
			"type": "meshPhongMaterial",
			"color": 0x8B8D7A,
			"map": "images/gray_rock.png",
			"bumpMap": "images/gray_rock.png",
			"bumpScale": 0.4,
		},
	},
	{
		"type": "mesh",
		"name": "torus",
		"translate": [-50, 1.5, 36],
		"geometry": "torus",
		"rotation": [Math.PI/2, 0, 0],
		"radius": 8,
		"tube": 2,
		"radialSegments": 16,
		"tubularSegments": 32,
		"material": 
		{
			"type": "meshPhongMaterial",
			"color": 0x8B8D7A,
			"map": "images/gray_rock.png",
			"bumpMap": "images/gray_rock.png",
			"bumpScale": 0.4,
			"rotation": Math.PI/2,
		},
	},
	{
		"type": "mesh",
		"name": "cube",
		"translate": [5, 1, 10],
		"geometry": "cube",
		"rotation": [Math.PI/2, 0, 0],
		"width": 2,
		"height": 4,
		"depth": 2,
		"material": 
		{
			"type": "meshPhongMaterial",
			"color": 0x8B8D7A,
			"map": "images/gray_rock.png",
			"bumpMap": "images/gray_rock.png",
			"bumpScale": 0.1,
		},
	},
	{
		"type": "text",
		"text": "You can also use the mouse",
        "font": "optimer_bold",
		"size": 10,
		"height": 0.1,
		"bevelEnabled": false,
		"position": [0, -20, -200],
		"material": 
		{
			"type": "pointsMaterial",
            "size": 1,
            "transparent": true,
		},
	},
	
	/// Text
	
	/// Lights
	
	{
		"COMMENT": "White light",
		"type": "hemisphereLight",
		"name": "light",
		"skyColor": [1, 1, 1],
		"groundColor": [0, 0, 0],
	},
];

var titleTextArr = 
[
	{
		"COMMENT": "Text",
		"type": "text",
		"name": "text1",
		"text": "Look what you've done.",
		"position": [0, 18, -30],
		"rotation": [0, 0, 0],
		"size": 2,
		"height": 0.1,
		"curveSegments": 5,
		"material":
		{
			"color": 0xffffff,
		},
	},
	{
		"COMMENT": "Text 2",
		"type": "text",
		"name": "text2",
		"text": "Fix it",
		"position": [0, 7.5, 20],
		"rotation": [0, 0, 0],
		"visible": false,
		"material":
		{
			"color": 0x8a0707,
		}
	},
];

var wasdSpriteArr = 
[
	{
		"name": "wasdPicture",
		"type": "mesh",
		"translate": [0, -50, 0],
		"material": 
		{
			"type": "sprite",
			"map": "images/wasd.png",
		},
	},
];

var level1Children = 
[
	/// Camera
	
	{
		"COMMENT": "CAMERA LOOKING AT ORIGIN FROM ALONG THE Z AXIS",
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 20, 30], // look from
		"center": [0, 0, 0], // look at
		"vup": [0, 1, 0], // "up" direction
		"fov": 30,
	},
	
	/// Environment (ground and sky)
	
	{
		"COMMENT": "STARTING GROUND",
		"type": "mesh",
		"geometry": "plane",
		"name": "start",
		"width": 30,
		"height": 30,
		"rotation": [-Math.PI/2, 0, 0],
		"position": [0, -2, 0],
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "groundMat",
			"diffuseColor": 0xffdd99,
		},
	},
	{
		"COMMENT": "GROUND 2",
		"type": "mesh",
		"geometry": "plane",
		"name": "ground2",
		"width": 25,
		"height": 25,
		"rotation": [-Math.PI/2, 0, 0],
		"position": [0, -12, -37.5],
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "groundMat",
			"diffuseColor": 0xff6666,
		},
	},
	{
		"COMMENT": "GROUND 3",
		"type": "mesh",
		"geometry": "plane",
		"name": "ground3",
		"width": 20,
		"height": 20,
		"rotation": [-Math.PI/2, 0, 0],
		"position": [0, -22, -72.5],
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "groundMat",
			"diffuseColor": 0xd9b3ff,
		},
	},
	{
		"COMMENT": "GROUND 4",
		"type": "mesh",
		"geometry": "plane",
		"name": "ground4",
		"width": 15,
		"height": 15,
		"rotation": [-Math.PI/2, 0, 0],
		"position": [0, -32, -105],
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "groundMat",
			"diffuseColor": 0x99ffff,
		},
	},
	{
		"COMMENT": "GOAL GROUND",
		"type": "mesh",
		"geometry": "plane",
		"name": "goal",
		"width": 10,
		"height": 10,
		"rotation": [-Math.PI/2, 0, 0],
		"position": [0, -42, -135],
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "groundMat",
			"diffuseColor": 0x00b300,
		},
	},
	{
		"COMMENT": "SKYBOX",
		"type": "mesh",
		"name": "skybox",
		"translate": [0, 0, 0],
		"geometry": "sphere",
		"radius": 300,
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "skyMat",
			"diffuseMap": "images/IMG_0424 Panorama_sphere.jpg",
			"side": "back",
		},
	},
	
	/// Player
	
	{
		"COMMENT": "PLAYER BALL",
		"type": "mesh",
		"name": "playerBall",
		"translate": [0, -.5, 0],
		"geometry": "sphere",
		"radius": 1.5,
		"widthSegments": 16,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sphereMat",
			"diffuseColor": 0xffffff,
			"specular": [0.12, 0.12, 0.15],
		},
		"userData":
        {
            "scripts": ["ballScript"], 
            "velocity": [0,0,0],
            "mass": 5
        },
	},
	
	/// Objects
	
	{
		"COMMENT": "GREEN SPHERE 1 (top)",
		"type": "mesh",
		"name": "upSphere",
		"translate": [0, 2.5, -80],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "sphereMat",
			"diffuseColor": [0.2, 0.8, 0.2]
		},
		"userData":
        {
            "velocity": [0,0,0],
            "mass": 5
        },
	},
	{
		"COMMENT": "GREEN SPHERE 2 (bottom)",
		"type": "mesh",
		"name": "downSphere",
		"translate": [0, -2.5, -80],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "sphereMat",
			"diffuseColor": [0.2, 0.8, 0.2]
		},
		"userData":
        {
            "velocity": [0,0,0],
            "mass": 5
        },
	},
	{
		"COMMENT": "GREEN SPHERE 3 (left)",
		"type": "mesh",
		"name": "leftSphere",
		"translate": [-2.5, 0, -80],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "sphereMat",
			"diffuseColor": [0.2, 0.8, 0.2]
		},
		"userData":
        {
            "velocity": [0,0,0],
            "mass": 5
        },
	},
	{
		"COMMENT": "GREEN SPHERE 4 (right)",
		"type": "mesh",
		"name": "rightSphere",
		"translate": [2.5, 0, -80],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "sphereMat",
			"diffuseColor": [0.2, 0.8, 0.2]
		},
		"userData":
        {
            "velocity": [0,0,0],
            "mass": 5
        },
	},
	
	/// Lights
	
	{
		"COMMENT": "Red",
		"type": "spotLight",
		"name": "spotLight1",
		"color": 0xff0000,
		"position": [50, 25, 0],
		"intensity": 1,
		"castShadow": true,
		"target": "playerBall",
	},
	{
		"COMMENT": "Green",
		"type": "spotLight",
		"name": "spotLight2",
		"color": 0x00ff00,
		"position": [-50, 25, 50],
		"intensity": 1,
		"castShadow": true,
		"target": "playerBall",
	},
	{
		"COMMENT": "Blue",
		"type": "spotLight",
		"name": "spotLight3",
		"color": 0x0000ff,
		"position": [-50, 25, -50],
		"intensity": 1,
		"castShadow": true,
		"target": "playerBall",
	},
];


// Scene objects
var titleScene = 
{
"COMMENT": "Rotating camera",
"type": "node",
"name": "rootNode",
"scriptFiles": [ "scripts/sprint3TitleScript.js" ],

"userData":
{
	"scripts": ["sceneControl"]
},

"children": introStageChildren.concat(titleTextArr),
};

var level0 = 
{ 
"COMMENT": "Sprint 3: Objects, Sprites, and Point Clouds",
"type": "node",
"name": "rootNode",
"scriptFiles": [ "scripts/sprint3Script.js" ],
"controls": "pointerLock",

"userData":
{
	"scripts": ["sceneControl"]
},

"children": introStageChildren.concat(wasdSpriteArr),
};

var level1 = 
{ 
"COMMENT": "Sprint 2: Lights and Basic Materials",
"type": "node",
"name": "rootNode",
"scriptFiles": [ "scripts/sprint2Script.js" ],

"userData":
{
	"scripts": ["sceneControl"]
},
"backgroundMusic": "sound/bgm/Drive_Down_These_Roads.mp3",

"children": level1Children,
};

