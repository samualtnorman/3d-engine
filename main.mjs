"use strict";

import { Vector, Triangle, Mesh, CubeMesh, Mat4x4, matProj, matRotX, matRotZ } from "./modules/3d-engine.mjs";

canvas.height = window.innerHeight;
canvas.width  = window.innerWidth;

var context      = canvas.getContext("2d"),
	fNear        = 0.1,
	fFar         = 1000,
	fFov         = 90,
	fAspectRatio = canvas.height / canvas.width,
	fFovRad      = Math.tan(fFov * 0.5 / 180 * Math.PI);

var cube = new CubeMesh;

drawLoop();

function drawLoop() {
	var fTheta = 0.001 * performance.now();

	// Rotation Z
	matRotZ[0][0] = Math.cos(fTheta);
	matRotZ[0][1] = Math.sin(fTheta);
	matRotZ[1][0] = -Math.sin(fTheta);
	matRotZ[1][1] = Math.cos(fTheta);
	matRotZ[2][2] = 1;
	matRotZ[3][3] = 1;

	// Rotation X
	matRotX[0][0] = 1;
	matRotX[1][1] = Math.cos(fTheta * 0.5);
	matRotX[1][2] = Math.sin(fTheta * 0.5);
	matRotX[2][1] = -Math.sin(fTheta * 0.5);
	matRotX[2][2] = Math.cos(fTheta * 0.5);
	matRotX[3][3] = 1;

	// Draw Triangles
	matProj[0][0] = fAspectRatio * fFovRad;
	matProj[1][1] = fFovRad;
	matProj[2][2] = fFar / (fFar - fNear);
	matProj[3][2] = (-fFar * fNear) / (fFar - fNear);
	matProj[2][3] = 1;
	matProj[3][3] = 0;

	context.clearRect(0, 0, canvas.width, canvas.height);

	cube.draw();

	setTimeout(drawLoop, 0);
}

onresize = () => {
	canvas.height = window.innerHeight;
	canvas.width  = window.innerWidth;
	fAspectRatio = canvas.height / canvas.width;
	cube.draw();
}
