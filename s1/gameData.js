var level0 = 
{ 
"COMMENT": "A CUBE, SPHERE, AND DIRECTIONAL LIGHTS",
"type": "node",
"name": "rootNode",
"scriptFiles": [ "gameScript.js" ],

"userData":
{
	"scripts": ["sceneControl"]
},
"backgroundMusic": "sound/bgm/Drive_Down_These_Roads.mp3",

"children":
[
	/// Camera
	
	{
		"COMMENT": "CAMERA LOOKING AT ORIGIN FROM ALONG THE Z AXIS",
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 20, 30], // look from
		"center": [0, 0, 0], // look at
		"vup": [0, 1, 0], // "up" direction
		"fov": 30
	},
	
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
		"COMMENT": "HEMISPHERE LIGHT",
		"type": "hemisphereLight",
		"name": "hemisphereLight",
		"skyColor": [0.8, 0.9, 1],
		"groundColor": 0xffefcc,
		"intensity": 1,
		"position": [0, 50, 0]
	},
	
	/// Environment (ground and sky)
	
	{
		"COMMENT": "STARTING GROUND",
		"type": "ground",
		"name": "start",
		"width": 30,
		"height": 30,
		"rotation": [-Math.PI/2, 0, 0],
		"position": [0, -2, 0],
		"material": 
		{
			"type": "meshBasicMaterial",
			"name": "groundMat",
			"color": 0xffdd99,
			"side": "both",
		},
	},
	{
		"COMMENT": "GROUND 2",
		"type": "ground",
		"name": "ground2",
		"width": 25,
		"height": 25,
		"rotation": [-Math.PI/2, 0, 0],
		"position": [0, -12, -37.5],
		"material": 
		{
			"type": "meshBasicMaterial",
			"name": "groundMat",
			"color": 0xff6666,
			"side": "both",
		},
	},
	{
		"COMMENT": "GROUND 3",
		"type": "ground",
		"name": "ground3",
		"width": 20,
		"height": 20,
		"rotation": [-Math.PI/2, 0, 0],
		"position": [0, -22, -72.5],
		"material": 
		{
			"type": "meshBasicMaterial",
			"name": "groundMat",
			"color": 0xd9b3ff,
			"side": "both",
		},
	},
	{
		"COMMENT": "GROUND 4",
		"type": "ground",
		"name": "ground4",
		"width": 15,
		"height": 15,
		"rotation": [-Math.PI/2, 0, 0],
		"position": [0, -32, -105],
		"material": 
		{
			"type": "meshBasicMaterial",
			"name": "groundMat",
			"color": 0x99ffff,
			"side": "both",
		},
	},
	{
		"COMMENT": "GOAL GROUND",
		"type": "ground",
		"name": "goal",
		"width": 10,
		"height": 10,
		"rotation": [-Math.PI/2, 0, 0],
		"position": [0, -42, -135],
		"material": 
		{
			"type": "meshBasicMaterial",
			"name": "groundMat",
			"color": 0x00b300,
			"side": "both",
		},
	},
	
	/// Player
	
	{
		"COMMENT": "PLAYER BALL",
		"type": "mesh",
		"name": "mainBall",
		"translate": [0, -.5, 0],
		"geometry": "sphere",
		"radius": 1.5,
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sphereMat",
			"diffuseColor": 0x0052cc,
			"color": 0x0052cc,
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
]
};

