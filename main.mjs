"use strict";

import { CubeMesh, Camera, Matrix } from "./modules/3d_engine.mjs";

var camera = new Camera(canvas),
    cube     = new CubeMesh,
	context  = canvas.getContext("2d"),
	speedX   = (Math.random() * 2 - 1) * 0.02,
	speedY   = (Math.random() * 2 - 1) * 0.02,
	speedZ   = (Math.random() * 2 - 1) * 0.02;

onresize = function () {
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
}

onresize();
drawLoop();

function drawLoop() {
	cube.rotate(speedX, speedY, speedZ);

	context.clearRect(0, 0, canvas.width, canvas.height);
	camera.draw(cube);
	setTimeout(drawLoop, 0);
}
