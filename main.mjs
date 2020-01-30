"use strict";

import { CubeMesh, Camera, Mesh, Vector, Triangle } from "./modules/3d_engine.mjs";

var camera = new Camera(canvas),
    mesh,//     = new CubeMesh,
	context  = canvas.getContext("2d"),
	speedX   = (Math.random() * 2 - 1) * 0.04,
	speedY   = (Math.random() * 2 - 1) * 0.04,
	speedZ   = (Math.random() * 2 - 1) * 0.04,
	frames   = 0,
	time     = Math.round(Date.now() / 1000);

fileUpload.files[0].text().then(text => {
	var vectors = [],
		tris = [];

	for (var line of text.split("\n")) {
		var words = line.split(" ");

		if (words[0] == "v")
			vectors.push(new Vector(words[1], words[2], words[3]));
		else if (words[0] == "f")
			tris.push(new Triangle(vectors[words[1] - 1], vectors[words[2] - 1], vectors[words[3] - 1]));
	}

	mesh = new Mesh(...tris);

	mesh.rotate(Math.PI, 0, 0);
	mesh.translate(0, 1, 0);

	onresize = function () {
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
		draw();
	}

	drawLoop();
	onresize();
});



//onresize();
//drawLoop();

function draw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	camera.draw(mesh);
	frames++;
}

function drawLoop() {
	if (time < Math.round(Date.now() / 1000)) {
		console.log(`FPS: ${frames}`);
		frames = 0;
		time = Math.round(Date.now() / 1000);
	}

	mesh.rotate(0, speedY, 0);
	draw();
	setTimeout(drawLoop, 0);
}
