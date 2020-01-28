"use strict";

export class Vector extends Array {
	constructor(x = 0, y = 0, z = 0) {
		super(x, y, z);

		for (var i = 0; i < 3; i++) {
			var number = Number(this[i]);

			if (isNaN(number))
				throw new TypeError(`"${this[i]}" cannot be converted to number`);

			this[i] = number;
		}
	}

	toObject() {
		return { x: this.x, y: this.y, z: this.z };
	}

	clone() {
		return new Vector(...this);
	}

	translate(x, y, z) {
		this.x += x;
		this.y += y;
		this.z += z;
	}

	set(x, y, z) {
		if (x != undefined)
			this.x = x;

		if (y != undefined)
			this.y = y;

		if (z != undefined)
			this.z = z;
	}

	get x() {
		return this[0];
	}
	set x(x) {
		return (this[0] = x);
	}

	get y() {
		return this[1];
	}
	set y(y) {
		return (this[1] = y);
	}

	get z() {
		return this[2];
	}
	set z(z) {
		return (this[2] = z);
	}
}

export class Triangle extends Array {
	constructor(a = new Vector, b = new Vector, c = new Vector) {
		super(a, b, c);

		for (var vector of this)
			if (vector.constructor != Vector)
				throw new TypeError(`"${vector}" is not a vector`);
	}

	clone() {
		return this.map(v => v.clone());
	}

	translate(x, y, z) {
		for (var vector of this)
			vector.translate(x, y, z)
	}

	draw(context) {
		context.beginPath();
		context.moveTo(this[2].x, this[2].y);

		for (var vector of this)
			context.lineTo(vector.x, vector.y)
		
		context.stroke();
	}

	map(...args) {
		return new Triangle(...[ ...this ].map(...args));
	}
}

export class Mesh extends Array {
	constructor(...tris) {
		super(...tris);

		for (var tri of this)
			if (tri.constructor != Triangle)
				throw new TypeError(`"${tri}" is not a triangle`);
	}

	clone() {
		// TODO: replace naive clone aproach, keep vectors intact, currently clones end up with unique vectors for every tri
		/*var o       = [],
			vectors = this.vectors;
		
		for (var vector of vectors)*/


		return this.map(t => t.clone());
	}

	draw(context) {
		for (var tri of this)
			tri.draw(context);
	}

	translate(x, y, z) {
		for (var vector of this.vectors)
			vector.translate(x, y, z);
	}

	get vectors() {
		var o = [];

		for (var triangle of this)
			for (var vector of triangle)
				if (!o.includes(vector))
					o.push(vector);
		
		return o;
	}
}

export class CubeMesh extends Mesh {
	constructor() {
		var points = [
			new Vector(0, 0, 0),
			new Vector(0, 0, 1),
			new Vector(0, 1, 0),
			new Vector(0, 1, 1),
			new Vector(1, 0, 0),
			new Vector(1, 0, 1),
			new Vector(1, 1, 0),
			new Vector(1, 1, 1)
		];
			
		super(
			// South Face
			new Triangle(points[0b000], points[0b010], points[0b110]),
			new Triangle(points[0b000], points[0b110], points[0b100]),
			
			// East Face
			new Triangle(points[0b100], points[0b110], points[0b111]),
			new Triangle(points[0b100], points[0b111], points[0b101]),
			
			// North Face
			new Triangle(points[0b101], points[0b111], points[0b011]),
			new Triangle(points[0b101], points[0b011], points[0b001]),
			
			// West Face
			new Triangle(points[0b001], points[0b011], points[0b010]),
			new Triangle(points[0b001], points[0b010], points[0b000]),
			
			// Top Face
			new Triangle(points[0b010], points[0b011], points[0b111]),
			new Triangle(points[0b010], points[0b111], points[0b110]),
			
			// Bottom Face
			new Triangle(points[0b101], points[0b001], points[0b000]),
			new Triangle(points[0b101], points[0b000], points[0b100])
		);

	}
}

export class Matrix extends Array {
	constructor() {
		super([ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ]);
	}

	multiply(vector) {
		var o = new Vector(
				vector.x * this[0][0] + vector.y * this[1][0] + vector.z * this[2][0] + this[3][0],
				vector.x * this[0][1] + vector.y * this[1][1] + vector.z * this[2][1] + this[3][1],
				vector.x * this[0][2] + vector.y * this[1][2] + vector.z * this[2][2] + this[3][2]
			),
		    w = vector.x * this[0][3] + vector.y * this[1][3] + vector.z * this[2][3] + this[3][3];

		if (w) {
			o.x /= w;
			o.y /= w;
			o.z /= w;
		}

		return o;
	}
}

export class Viewport {
	near = 0.1
	far  = 1000
	fov  = 90
	
	constructor(canvas) {
		this.aspectRatio = canvas.height / canvas.width;
		this.fovRad      = 1 / Math.tan(this.fov * 0.5 / 180 * Math.PI);
		this.projMatr = new Matrix;
		this.canvas      = canvas;
		this.context     = canvas.getContext("2d");

		this.projMatr[0][0] = this.aspectRatio * this.fovRad;
		this.projMatr[1][1] = this.fovRad;
		this.projMatr[2][2] = this.far / (this.far - this.near);
		this.projMatr[3][2] = (-this.far * this.near) / (this.far - this.near);
		this.projMatr[2][3] = 1;
		this.projMatr[3][3] = 0;
	}

	draw(...meshes) {
		var theta = 0.001 * performance.now(),
		    rotXMatr = new Matrix,
			rotZMatr = new Matrix,
			speedX   = 0.5,
			speedZ   = 1;

		// Rotation X
		rotXMatr[0][0] =  1;
		rotXMatr[1][1] =  Math.cos(theta * speedX);
		rotXMatr[1][2] =  Math.sin(theta * speedX);
		rotXMatr[2][1] = -Math.sin(theta * speedX);
		rotXMatr[2][2] =  Math.cos(theta * speedX);
		rotXMatr[3][3] =  1;

		// Rotation Z
		rotZMatr[0][0] =  Math.cos(theta * speedZ);
		rotZMatr[0][1] =  Math.sin(theta * speedZ);
		rotZMatr[1][0] = -Math.sin(theta * speedZ);
		rotZMatr[1][1] =  Math.cos(theta * speedZ);
		rotZMatr[2][2] =  1;
		rotZMatr[3][3] =  1;

		for (var mesh of meshes) {
			var projected = mesh.clone(),
				vectors   = projected.vectors;

			for (var i = 0; i < vectors.length; i++) {
				vectors[i].set(...rotXMatr.multiply(vectors[i]));
				vectors[i].set(...rotZMatr.multiply(vectors[i]));
				vectors[i].translate(0, 0, 3);
				vectors[i].set(...this.projMatr.multiply(vectors[i]));

				vectors[i].x = (vectors[i].x + 1) * canvas.width / 2;
				vectors[i].y = (vectors[i].y + 1) * canvas.height / 2;
			}

			projected.draw(this.context);
		}
	}
}
