var level0 = { 
"COMMENT": "A spot light and bouncing globe",
"type": "node",
"name": "rootNode",

"children":
[
	{
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 4, 9],
		"center": [0, 0.85, 0],
		"vup": [0, 1, 0],
		"fov": 24
	},
	{
		"type": "hemisphereLight",
		"name": "hlight",
		"skyColor": [0.7, 0.7, 1.0],
		"groundColor": [0.2, 0.0, 0.1],
		"intensity": 0.6
	},
	{
		"type": "node",
		"name": "spotTarget",
		"translate": [0,0,0]
	},
	{
		"type": "spotLight",
		"name": "slight", 
		"position": [-1.5,5,1],
		"target": "spotTarget",
		"color": [1.5, 1.3, 0.9],
		"intensity": 1.0,
		"angle": 0.7,
		"penumbra": 0.1,
		"decay": 1.0,
		"distance": 100,
		"castShadow": true,
		"mapSize": 512
	},
	{
		"type": "mesh",
		"name": "theCube",
		"scale": [4, 0.07, 4],
		"translate": [0, 0, 0],
		"geometry": "cube",
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "cubeMat",
			"diffuseColor": [0.5, 0.4, 0.4],
			"specularColor": [0.01, 0.01, 0.01],
			"shininess": 200
		}
	},

	{
		"type": "mesh",
		"name": "globe",
		"scale": [1.2, 1.2, 1.2],
		"translate": [0, 1.3, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 32,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm2",
			"diffuseColor": [1, 1, 1],
			"specularColor": [0.04, 0.04, 0.04],
			"diffuseMap": "earth2k.jpg",
			"bumpMap": "earth2k.jpg",
			"bumpScale": 0.01,
			"shininess": 200
		},
		"userData": 
		{ 
			"scripts": ["rotateScript", "bounceScript"],
			"rotationSpeed": 0.5,
			"bounceBottom": 1.22,
			"bounceHeight": 0.5
		}
	}
]
}


