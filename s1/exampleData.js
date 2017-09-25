var level0 = 
{ 
"COMMENT": "A CUBE, SPHERE, AND DIRECTIONAL LIGHTS",
"type": "node",
"name": "rootNode",

"userData":
{
	"scripts": ["sceneControl"]
},

"children":
[
	{
		"COMMENT": "CAMERA LOOKING AT ORIGIN FROM ALONG THE Z AXIS",
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 0, 20], // look from
		"center": [0, 0, 0], // look at
		"vup": [0, 1, 0], // "up" direction
		"fov": 30
	},
	{
		"COMMENT": "DIRECTIONAL LIGHT",
		"type": "directionalLight",
		"name": "light1",
		"color": [1, 1, 0.5],
		"position": [0.5, 1, 0.5]
	},
	{
		"COMMENT": "DIRECTIONAL LIGHT",
		"type": "directionalLight",
		"name": "light2",
		"color": [0.3, 0.3, 1],
		"position": [-0.5, -1, 0.5]
	},
	{
		"COMMENT": "DIRECTIONAL LIGHT",
		"type": "directionalLight",
		"name": "light2",
		"color": [0.3, 0.3, 0.3],
		"position": [0, 0, 1]
	},

	{
		"COMMENT": "GREEN SPHERE 1 (top)",
		"type": "mesh",
		"name": "upSphere",
		"translate": [0, 2.5, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "sphereMat",
			"diffuseColor": [0.2, 0.8, 0.2]
		}
	},
	{
		"COMMENT": "GREEN SPHERE 2 (bottom)",
		"type": "mesh",
		"name": "downSphere",
		"translate": [0, -2.5, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "sphereMat",
			"diffuseColor": [0.2, 0.8, 0.2]
		}
	},

	{
		"COMMENT": "GREEN SPHERE 3 (left)",
		"type": "mesh",
		"name": "leftSphere",
		"translate": [-2.5, 0, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "sphereMat",
			"diffuseColor": [0.2, 0.8, 0.2]
		}
	},
	{
		"COMMENT": "GREEN SPHERE 4 (right)",
		"type": "mesh",
		"name": "rightSphere",
		"translate": [2.5, 0, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "sphereMat",
			"diffuseColor": [0.2, 0.8, 0.2]
		}
	},
]
};

