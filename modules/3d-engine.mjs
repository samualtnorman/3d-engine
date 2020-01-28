"use strict";

export class Vector extends Array {
	constructor(...args) {
		// accepts object with x y z numbers
		// accepts array with 3 numbers
		// accepts 3 numbers
		// defaults to array of 3 zeroes

		if (!args.length)
			var x = 0, y = 0, z = 0;
		else if (Array.isArray(args[0]))
			var [ x = 0, y = 0, z = 0 ] = args[0];
		else if (typeof args[0] == "object")
			var { x = 0, y = 0, z = 0 } = args[0];
		else if (args.length > 2)
			var [ x = 0, y = 0, z = 0 ] = args;
		else
			throw new TypeError("invalid arguments, input must be 3 numbers");

		super(...[ x, y, z ].map(n => Number(n) || 0));
	}

	toObject() {
		return { x: this.x, y: this.y, z: this.z };
	}

	map(...args) {
		return [ ...this ].map(...args);
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

	project() {
		return Vector.multiply(this, matProj);
	}

	get clone() {
		return new Vector(...this);
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
	constructor(...args) {
		// accepts array of 3 Vec3ds
		// accepts 3 Vec3ds
		// defaults to 3 default Vec3d

		if (!args.length)
			var a = new Vector, b = new Vector, c = new Vector;
		else if (args.length > 2)
			var [ a = new Vector, b = new Vector, c = new Vector ] = args;
		else if (Array.isArray(args[0]))
			var [ a = new Vector, b = new Vector, c = new Vector ] = args[0];
		else
			throw new TypeError(`invalid arguments, input must be 3 Vec3d objects`);

		for (var vec of [ a, b, c ])
			if (!vec || vec.constructor != Vector)
				throw new TypeError("invalid arguments, input must be 3 Vec3d objects");
		
		super(a, b, c);
	}

	draw() {
		var triRotatedZ = this.clone;

		triRotatedZ[0] = Vector.multiply(triRotatedZ[0], matRotZ);
		triRotatedZ[1] = Vector.multiply(triRotatedZ[1], matRotZ);
		triRotatedZ[2] = Vector.multiply(triRotatedZ[2], matRotZ);

		var triRotatedX = triRotatedZ;

		triRotatedX[0] = Vector.multiply(triRotatedX[0], matRotX);
		triRotatedX[1] = Vector.multiply(triRotatedX[1], matRotX);
		triRotatedX[2] = Vector.multiply(triRotatedX[2], matRotX);

		var triangleTranslated = triRotatedX;

		triangleTranslated[0].z += 3;
		triangleTranslated[1].z += 3;
		triangleTranslated[2].z += 3;

		var projected = triangleTranslated.projected;

		for (var i = 0; i < 3; i++) {
			projected[i].x = (projected[i].x + 1) * canvas.width / 2;
			projected[i].y = (projected[i].y + 1) * canvas.height / 2;
		}

		context.beginPath();
		context.moveTo(projected[2].x, projected[2].y);

		for (var i = 0; i < 3; i++) {
			context.lineTo(projected[i].x, projected[i].y);
		}

		context.stroke();
	}

	map(...args) {
		return [ ...this ].map(...args);
	}

	get projected() {
		return new Triangle(
			this[0].projected,
			this[1].projected,
			this[2].projected
		);
	}

	get clone() {
		return new Triangle(...this.map(a => a.clone));
	}
}

export class Mesh extends Array {
	constructor(...args) {
		// accepts array of triangles
		// accepts triangles
		// no default

		if (args.length > 1)
			var mesh = args;
		else if (Array.isArray(args[0]))
			var mesh = args[0];
		else
			throw new TypeError("invalid arguments, input must be Triangle objects");
		
		for (var tri of mesh)
			if (tri.constructor != Triangle)
				throw new TypeError("invalid arguments, input must be Triangle objects");
		

		super(...mesh);
	}

	map(...args) {
		return [ ...this ].map(...args);
	}

	draw() {
		for (var tri of this)
			tri.draw();
	}

	get clone() {
		return new Mesh(...this.map(a => a.clone));
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

export class Mat4x4 extends Array {
	constructor() {
		super([ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ]);
	}
}

var matProj = new Mat4x4,
    matRotZ = new Mat4x4,
    matRotX = new Mat4x4;
