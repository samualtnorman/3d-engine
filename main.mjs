"use strict";

import { CubeMesh, Viewport, Matrix } from "./modules/3d_engine.mjs";

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

var viewport = new Viewport(canvas),
    cube     = new CubeMesh,
	context  = canvas.getContext("2d"),
	speedX   = (Math.random() * 2 - 1) * 0.01,
	speedZ   = (Math.random() * 2 - 1) * 0.01;

drawLoop();

function drawLoop() {
	var rotXMatr = new Matrix,
		rotZMatr = new Matrix;

	// Rotation X
	rotXMatr[0][0] =  1;
	rotXMatr[1][1] =  Math.cos(speedX);
	rotXMatr[1][2] =  Math.sin(speedX);
	rotXMatr[2][1] = -Math.sin(speedX);
	rotXMatr[2][2] =  Math.cos(speedX);
	rotXMatr[3][3] =  1;

	// Rotation Z
	rotZMatr[0][0] =  Math.cos(speedZ);
	rotZMatr[0][1] =  Math.sin(speedZ);
	rotZMatr[1][0] = -Math.sin(speedZ);
	rotZMatr[1][1] =  Math.cos(speedZ);
	rotZMatr[2][2] =  1;
	rotZMatr[3][3] =  1;

	var vectors = cube.vectors;

	for (var i = 0; i < vectors.length; i++) {
		vectors[i]
			.set(...rotXMatr.multiply(vectors[i]))
			.set(...rotZMatr.multiply(vectors[i]))
	}

	context.clearRect(0, 0, canvas.width, canvas.height);
	viewport.draw(cube);
	setTimeout(drawLoop, 0);
}
