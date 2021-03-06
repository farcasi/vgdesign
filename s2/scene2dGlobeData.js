var level0 = { 
"COMMENT": "Globe with a few lights",
"type": "node",
"name": "rootNode",

"children":
[
	{
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 4, 9],
		"center": [0, 0, 0],
		"vup": [0, 1, 0],
		"fov": 28
	},
	{
		"type": "hemisphereLight",
		"name": "dlight1",
		"skyColor": [1, 1, 1],
		"groundColor": [0, 0, 0],
		"intensity": 0.7
	},
	{
		"type": "mesh",
		"name": "globe",
		"scale": [2, 2, 2],
		"translate": [0, 0, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 32,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm2",
			"color": [1, 1, 1],
			"specular": [0.04, 0.04, 0.04],
			"map": "earth2k.jpg",
			"bumpMap": "earth2k.jpg",
			"bumpScale": 0.01,
			"shininess": 200
		},
		"userData": 
		{ 
			"scripts": ["rotateScript"],
			"rotationSpeed": 0.1
		}
	},


	{
		"type": "node",
		"name": "light1",
		"translate": [2, 2, 2.5],
		"children": 
		[
			{
				"type": "pointLight",
				"name": "plight1",
				"color": [1, 1, 0.5],
				"intensity": 1.5,
				"position": [0, 0, 0]
			},
			{
				"type": "mesh",
				"name": "sphere1",
				"scale": [0.1, 0.1, 0.1],
				"geometry": "sphere",
				"widthSegments": 16,
				"heightSegments": 16,
				"material": 
				{
					"type": "meshBasicMaterial",
					"name": "mat1",
					"color": [1, 1, 0]
				}
			}
		]
	},


	{
		"type": "node",
		"name": "light2",
		"translate": [-2, 2, 2.5],
		"children": 
		[
			{
				"type": "pointLight",
				"name": "plight2",
				"color": [0.5, 0, 0.2],
				"intensity": 1.5,
				"position": [0, 0, 0]
			},
			{
				"type": "mesh",
				"name": "sphere2",
				"scale": [0.1, 0.1, 0.1],
				"geometry": "sphere",
				"widthSegments": 16,
				"heightSegments": 16,
				"material": 
				{
					"type": "meshBasicMaterial",
					"name": "mat1",
					"color": [1, 0, 0]
				}
			}
		]
	}
]
}

