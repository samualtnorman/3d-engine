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

	project() {
		return Vector.multiply(this, matProj);
	}

	multiply(matrix) {

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

	static multiply(vector, matrix) {
		var o = new Vector(
			vector.x * matrix[0][0] + vector.y * matrix[1][0] + vector.z * matrix[2][0] + matrix[3][0],
			vector.x * matrix[0][1] + vector.y * matrix[1][1] + vector.z * matrix[2][1] + matrix[3][1],
			vector.x * matrix[0][2] + vector.y * matrix[1][2] + vector.z * matrix[2][2] + matrix[3][2]
		);

		var w = vector.x * matrix[0][3] + vector.y * matrix[1][3] + vector.z * matrix[2][3] + matrix[3][3];

		if (w) {
			o.x /= w;
			o.y /= w;
			o.z /= w;
		}

		return o;
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

	project() {
		return this.map(v => v.project());
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
		return this.map(t => t.clone());
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
