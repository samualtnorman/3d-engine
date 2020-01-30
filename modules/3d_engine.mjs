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

		for (var tri of this)
			if (tri.constructor != Triangle)
				throw new TypeError(`"${tri}" is not a triangle`);
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
			new Vector(-1, -1, -1),
			new Vector(-1, -1, 1),
			new Vector(-1, 1, -1),
			new Vector(-1, 1, 1),
			new Vector(1, -1, -1),
			new Vector(1, -1, 1),
			new Vector(1, 1, -1),
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

export class Camera {
	near     = 0.1
	far      = 1000
	projMatr = new Matrix
	
	constructor(canvas) {
		canvas.onresize = this.onresize;

		this.canvas      = canvas;
		this.context     = canvas.getContext("2d");
		this.fov = 90;

		this.onresize();
	}

	draw(...meshes) {
		if (this.modified) {
			this.projMatr[0][0] = this.aspectRatio * this.fovRad;
			this.projMatr[1][1] = this.fovRad;
			this.projMatr[2][2] = this.far / (this.far - this.near);
			this.projMatr[3][2] = (-this.far * this.near) / (this.far - this.near);
			this.projMatr[2][3] = 1;

			this.modified = false;
		}

		for (var mesh of meshes) {
			var projected = mesh.clone(),
				vectors   = projected.vectors;
			
			for (var i = 0; i < vectors.length; i++) {
				vectors[i]
					.translate(0, 0, 3)
					.set(...this.projMatr.multiply(vectors[i]))
					.set(
						(vectors[i].x + 1) * canvas.width / 2,
						(vectors[i].y + 1) * canvas.height / 2
					);
			}

			projected.draw(this.context);
		}
	}

	onresize() {
		this.aspectRatio = canvas.height / canvas.width;
		this.modified = true;
		console.log("!");
	}

	set fov(deg) {
		this.fovRad = 1 / Math.tan(deg * 0.5 / 180 * Math.PI);
		this.modified = true;
	}
}
