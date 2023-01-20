const canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

// circle object

class CanvasEntity {
	constructor(x, y, radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;
	}
	set(x) {
		this.x = x;
	}
	set(y) {
		this.y = y;
	}
	set(radius) {
		this.radius = radius;
	}
	render() {
		console.log("this element does not have a concrete render method");
	}
}

class Circle extends CanvasEntity {
	constructor(x, y, radius, mass) {
		super(x, y, radius);
		this.mass = mass;
		this.dx = 10;
		this.dy = 0;
	}

	set(mass) {
		this.mass = mass;
	}
	render() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.stroke();
	}
	animate() {
		console.log("circle is animating");
		this.x += this.dx;
		this.y += this.dy;

		// wall bounces
		if (this.x + this.radius >= innerWidth || this.x - this.radius < 0) {
			this.dx = -this.dx;
		}
		if (this.y + this.radius >= innerHeight || this.y - this.radius < 0) {
			this.dy = -this.dy;
		}
		this.dy += 2;
	}
}
class Peg extends CanvasEntity {
	constructor(position, radius) {
		super(position, radius);
	}
	set(position) {
		this.position = position;
	}
	set(radius) {
		this.radius = radius;
	}

	render() {
		console.log("peg rendering has not been enabled yet");
	}
}

const c = new Circle(200, 200, 100, 2);
function animate() {
	requestAnimationFrame(animate);
	ctx.clearRect(0, 0, innerWidth, innerHeight);
	c.animate();
	c.render();
}

animate();
