"use strict";

class Vec3d extends Array {
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

	get projected() {
		var o = new Vec3d(
			this.x * matProj[0][0] + this.y * matProj[1][0] + this.z * matProj[2][0] + matProj[3][0],
			this.x * matProj[0][1] + this.y * matProj[1][1] + this.z * matProj[2][1] + matProj[3][1],
			this.x * matProj[0][2] + this.y * matProj[1][2] + this.z * matProj[2][2] + matProj[3][2]
		);

		var w = this.x * matProj[0][3] + this.y * matProj[1][3] + this.z * matProj[2][3] + matProj[3][3];

		console.log(w);

		if (w) {
			o.x /= w;
			o.y /= w;
			o.z /= w;
		}

		return o;
	}
}

class Triangle extends Array {
	constructor(...args) {
		// accepts array of 3 Vec3ds
		// accepts 3 Vec3ds
		// defaults to 3 default Vec3d

		if (!args.length)
			var a = new Vec3d, b = new Vec3d, c = new Vec3d;
		else if (args.length > 2)
			var [ a = new Vec3d, b = new Vec3d, c = new Vec3d ] = args;
		else if (Array.isArray(args[0]))
			var [ a = new Vec3d, b = new Vec3d, c = new Vec3d ] = args[0];
		else
			throw new TypeError(`invalid arguments, input must be 3 Vec3d objects`);

		for (var vec of [ a, b, c ])
			if (!vec || vec.constructor != Vec3d)
				throw new TypeError("invalid arguments, input must be 3 Vec3d objects");
		
		super(a, b, c);
	}

	draw() {
		var triangleTranslated = new Triangle(this);

		triangleTranslated[0].z += 3;
		triangleTranslated[1].z += 3;
		triangleTranslated[2].z += 3;

		var projected = triangleTranslated.projected;

		projected[0].x++;
		projected[0].y++;
		projected[1].x++;
		projected[1].y++;
		projected[2].x++;
		projected[2].y++;

		projected[0].x *= canvas.width / 2;
		projected[0].y *= canvas.height / 2;
		projected[1].x *= canvas.width / 2;
		projected[1].y *= canvas.height / 2;
		projected[2].x *= canvas.width / 2;
		projected[2].y *= canvas.height / 2;

		context.beginPath();
		context.moveTo(projected[0].x, projected[0].y);
		context.lineTo(projected[1].x, projected[1].y);
		context.lineTo(projected[2].x, projected[2].y);
		context.lineTo(projected[0].x, projected[0].y);
		context.stroke();
	}

	get projected() {
		return new Triangle(
			this[0].projected,
			this[1].projected,
			this[2].projected
		);
	}
}

class Mesh extends Array {
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

	draw() {
		for (var tri of this)
			tri.draw();
	}
}

class CubeMesh extends Mesh {
	constructor() {
		var points = [
			new Vec3d(0, 0, 0), // 0
			new Vec3d(0, 0, 1), // 1
			new Vec3d(0, 1, 0), // 2
			new Vec3d(0, 1, 1), // 3
			new Vec3d(1, 0, 0), // 4
			new Vec3d(1, 0, 1), // 5
			new Vec3d(1, 1, 0), // 6
			new Vec3d(1, 1, 1)  // 7
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

class Mat4x4 extends Array {
	constructor() {
		super([ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ]);
	}
}

canvas.height = window.innerHeight;
canvas.width  = window.innerWidth;

var context      = canvas.getContext("2d"),
	fNear        = 0.1,
	fFar         = 1000,
	fFov         = 90,
	fAspectRatio = canvas.height / canvas.width,
	fFovRad      = Math.tan(fFov * 0.5 / 180 * Math.PI),
	matProj      = new Mat4x4;

matProj[0][0] = fAspectRatio * fFovRad;
matProj[1][1] = fFovRad;
matProj[2][2] = fFar / (fFar - fNear);
matProj[3][2] = (-fFar * fNear) / (fFar - fNear);
matProj[2][3] = 1;
matProj[3][3] = 0;

var cube = new CubeMesh;

cube.draw();