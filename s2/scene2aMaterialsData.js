var level0 = { 
"COMMENT": "Testing Phong Materials",
"type": "node",
"name": "rootNode",

"children":
[
	// CAMERA
	{
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 0, 20],
		"center": [0, 0, 0],
		"vup": [0, 1, 0],
		"fov": 30
	},

	// LIGHTS
	{
		"type": "directionalLight",
		"name": "dlight1",
		"color": [1, 1, 0.5],
		"position": [1, 2, 1]
	},
	{
		"type": "directionalLight",
		"name": "dlight2",
		"color": [0.1, 0.1, 0.3],
		"position": [-1, 0.1, 0.5]
	},
	{
		"type": "directionalLight",
		"name": "dlight3",
		"color": [0.1, 0.1, 0.1],
		"position": [0, 0, 1]
	},

	// PHONG MATERIALS (TOP ROW)
	{
		"type": "mesh",
		"name": "ls0",
		"scale": [2, 2, 2],
		"translate": [-5, 2.5, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm1",
			"diffuseColor": [1, 0.3, 0.3],
			"specular": [0.1, 0.1, 0.1],
			"shininess": 10
		}
	},
	{
		"type": "mesh",
		"name": "ms0",
		"scale": [2, 2, 2],
		"translate": [0, 2.5, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm2",
			"diffuseColor": [0.3, 1.0, 0.3],
			"specular": [0.02, 0.02, 0.02],
			"shininess": 80
		}
	},
	{
		"type": "mesh",
		"name": "rs0",
		"scale": [2, 2, 2],
		"translate": [5, 2.5, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm3",
			"diffuseColor": [0.3, 0.3, 1.0],
			"specular": [0.01, 0.01, 0.01],
			"shininess": 200
		}
	},

	// OTHER MATERIALS
	{
		"type": "mesh",
		"name": "ls1",
		"scale": [2, 2, 2],
		"translate": [-5, -2.5, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshBasicMaterial",
			"name": "sm1",
			"color": [1, 0.3, 0.3],
		}
	},
	{
		"type": "mesh",
		"name": "ms1",
		"scale": [2, 2, 2],
		"translate": [0, -2.5, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm2",
			"color": [1.0, 0.5, 0.5],
			"specular": [0, 0, 0],
			"shading": "flat"
		}
	},
	{
		"type": "mesh",
		"name": "rs1",
		"scale": [2, 2, 2],
		"translate": [5, -2.5, 0],
		"geometry": "sphere",
		"widthSegments": 32,
		"heightSegments": 16,
		"material": 
		{
			"type": "meshLambertMaterial",
			"name": "sm3",
			"diffuseColor": [0.3, 0.3, 1.0],
		}
	}
]
}

