var level0 = { 
"COMMENT": "Hemispherical light",
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
		"type": "directionalLight",
		"name": "dlight",
		"color": [0.2, 0.2, 0.1],
		"position": [1, 2, 1]
	},
	{
		"type": "hemisphereLight",
		"name": "hlight",
		"skyColor": [0.3, 0.3, 0.6],
		"groundColor": [0.2, 0.3, 0],
		"intensity": 1.0
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
			"color": [1, 0.3, 0.3],
			"specular": [0.8, 0.8, 0.8],
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
			"color": [0.3, 1.0, 0.3],
			"specular": [0.08, 0.08, 0.08],
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
			"color": [0.3, 0.3, 1.0],
			"specular": [0.03, 0.03, 0.03],
			"shininess": 200
		}
	}
]
}

