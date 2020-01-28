"use strict";

import { CubeMesh, Viewport } from "./modules/3d_engine.mjs";

var viewport = new Viewport(canvas),
	cube = new CubeMesh;

viewport.draw(cube);
