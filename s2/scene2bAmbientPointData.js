var level0 = { 
"COMMENT": "Ambient and Point Light",
"type": "node",
"name": "rootNode",

"children":
[
	{
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 0, 20],
		"center": [0, 0, 0],
		"vup": [0, 1, 0],
		"fov": 23
	},
	{
		"type": "pointLight",
		"name": "plight1",
		"color": [1, 1, 0.8],
		"intensity": 10.0,
		"position": [20, 20, 20],
		"distance": 40,
		"decay": 2
	},
	{
		"type": "ambientLight",
		"name": "alight",
		"color": [0.4, 0.4, 0.6]
	},
	{
		"type": "mesh",
		"name": "leftSphere",
		"scale": [2, 2, 2],
		"translate": [-4, 0, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm1",
			"diffuseColor": [1, 0.3, 0.3],
			"specular": [1, 1, 1],
			"shininess": 10
		}
	},
	{
		"type": "mesh",
		"name": "middleSphere",
		"scale": [2, 2, 2],
		"translate": [0, 0, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm2",
			"diffuseColor": [0.3, 1.0, 0.3],
			"specular": [0.1, 0.1, 0.1],
			"shininess": 80
		}
	},
	{
		"type": "mesh",
		"name": "rightSphere",
		"scale": [2, 2, 2],
		"translate": [4, 0, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm3",
			"diffuseColor": [0.3, 0.3, 1.0],
			"specular": [0.1, 0.1, 0.1],
			"shininess": 200
		}
	}
]
}

