"use strict";

export class Vector extends Array {
	constructor(x = 0, y = 0, z = 0) {
		super(x, y, z);

		this.verify();
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

		this.verify();

		return this;
	}

	set(x, y, z) {
		if (x != undefined)
			this.x = x;

		if (y != undefined)
			this.y = y;

		if (z != undefined)
			this.z = z;
		
		this.verify();
		
		return this;
	}

	verify() {
		for (var i = 0; i < 3; i++) {
			var number = Number(this[i]);

			if (isNaN(number))
				throw new TypeError(`"${this[i]}" cannot be converted to number`);

			this[i] = number;
		}
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
		var line1 = new Vector(
				this[1].x - this[0].x,
				this[1].y - this[0].y,
				this[1].z - this[0].z
			),
			line2 = new Vector(
				this[2].x - this[0].x,
				this[2].y - this[0].y,
				this[2].z - this[0].z
			),
			normal = new Vector(
				line1.y * line2.z - line1.z * line2.y,
				line1.z * line2.x - line1.x * line2.z,
				line1.x * line2.y - line1.y * line2.x,
			),
			l = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
		
		normal.set(normal.x / l, normal.y / l, normal.z / l);
		
		if (normal.z < 0) {
			context.beginPath();
			context.moveTo(this[2].x, this[2].y);

			for (var vector of this)
				context.lineTo(vector.x, vector.y)
			
			context.fillStyle = "green";
			context.strokeStyle = "black";

			context.fill();
			context.stroke();
		}
	}

	map(...args) {
		return new Triangle(...[ ...this ].map(...args));
	}
}

export class Mesh extends Array {
	constructor(...tris) {
		super(...tris);

		/*for (var tri of tris)
			if (tri.constructor != Triangle)
				throw new TypeError(`"${tri}" is not a triangle`);*/
	}

	clone() {
		var originalVectors = this.vectors,
			newVectors      = originalVectors.map(v => v.clone());

		return this.map(t => t.map(v => newVectors[originalVectors.indexOf(v)]));
	}

	draw(context) {
		for (var tri of this)
			tri.draw(context);
	}

	translate(x, y, z) {
		for (var vector of this.vectors)
			vector.translate(x, y, z);
	}

	rotate(x, y, z) {
		var rotXMatr = new Matrix4x4,
			rotYMatr = new Matrix4x4,
			rotZMatr = new Matrix4x4;

		// Rotation X
		rotXMatr[0][0] =  1;
		rotXMatr[1][1] =  Math.cos(x);
		rotXMatr[1][2] =  Math.sin(x);
		rotXMatr[2][1] = -Math.sin(x);
		rotXMatr[2][2] =  Math.cos(x);
		rotXMatr[3][3] =  1;

		// Rotation Y
		rotYMatr[0][0] =  Math.cos(y);
		rotYMatr[0][2] = -Math.sin(y);
		rotYMatr[1][1] =  1;
		rotYMatr[2][0] =  Math.sin(y);
		rotYMatr[2][2] =  Math.cos(y);
		rotYMatr[3][3] =  1;

		// Rotation Z
		rotZMatr[0][0] =  Math.cos(z);
		rotZMatr[0][1] =  Math.sin(z);
		rotZMatr[1][0] = -Math.sin(z);
		rotZMatr[1][1] =  Math.cos(z);
		rotZMatr[2][2] =  1;
		rotZMatr[3][3] =  1;

		var vectors = this.vectors;

		for (var vector of vectors)
			vector
				.set(...rotXMatr.multiply(vector))
				.set(...rotYMatr.multiply(vector))
				.set(...rotZMatr.multiply(vector));

		return this;
	}

	get vectors() {
		var o = [];

		for (var triangle of this)
			for (var vector of triangle)
				!o.includes(vector) && o.push(vector);
		
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

export class Matrix4x4 extends Array {
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

export class Camera {
	near     = 0.1
	far      = 1000
	projMatr = new Matrix4x4
	
	constructor(canvas) {
		this.canvas  = canvas;
		this.context = canvas.getContext("2d");
		this.fov     = 90;
	}

	draw(...meshes) {
		var aspectRatio = this.canvas.height / this.canvas.width,
			projMatr    = new Matrix4x4;
		
		projMatr[0][0] = aspectRatio * this.fovRad;
		projMatr[1][1] = this.fovRad;
		projMatr[2][2] = this.far / (this.far - this.near);
		projMatr[3][2] = (-this.far * this.near) / (this.far - this.near);
		projMatr[2][3] = 1;

		for (var mesh of meshes) {
			var meshClone = mesh.clone();

			for (var vector of meshClone.vectors)
				vector
					.translate(0, 0, 5)
					.set(...projMatr.multiply(vector))
					.set(
						(vector.x + 1) * this.canvas.width / 2,
						(vector.y + 1) * this.canvas.height / 2
					);

			meshClone.draw(this.context);
		}
	}

	set fov(fov) {
		this.fovRad = 1 / Math.tan(fov * 0.5 / 180 * Math.PI);
	}
}
