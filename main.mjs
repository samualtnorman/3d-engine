"use strict";

import { CubeMesh, Viewport } from "./modules/3d_engine.mjs";

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

var viewport = new Viewport(canvas),
    cube     = new CubeMesh,
    context  = canvas.getContext("2d");

drawLoop();

function drawLoop() {
	context.clearRect(0, 0, canvas.width, canvas.height);

	viewport.draw(cube);

	setTimeout(drawLoop, 0);
}
