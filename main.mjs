"use strict";

import { CubeMesh, Camera } from "./modules/3d_engine.mjs";

var camera = new Camera(canvas),
    cube     = new CubeMesh,
	context  = canvas.getContext("2d"),
	speedX   = (Math.random() * 2 - 1) * 0.05,
	speedY   = (Math.random() * 2 - 1) * 0.05,
	speedZ   = (Math.random() * 2 - 1) * 0.05,
	frames   = 0,
	time     = Math.round(Date.now() / 1000);

onresize = function () {
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
}

console.log(speedX, speedY, speedZ);

onresize();
drawLoop();

function drawLoop() {
	if (time < Math.round(Date.now() / 1000)) {
		console.log(`FPS: ${frames}`);
		frames = 0;
		time = Math.round(Date.now() / 1000);
	}

	cube.rotate(speedX, speedY, speedZ);
	context.clearRect(0, 0, canvas.width, canvas.height);
	camera.draw(cube);
	setTimeout(drawLoop, 0);

	frames++;
}
