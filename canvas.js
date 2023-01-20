//Global constants
const PEG_COLOR = "black";
const CIRCLE_RADIUS = 30;
const PEG_RADIUS = 20;

// Canvas Setup
const canvas = document.querySelector("canvas");
const container = document.querySelector(".canvas-container");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

//canvas event listener
const stopButton = document.createElement("button");
stopButton.textContent = "Stop";
stopButton.addEventListener("click", (e) => {
	console.log("this button has not been configured yet");
});

document.body.append(stopButton);

// super class for any physical element within the canvas (ball and pegs)
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

//Circle child class
class Circle extends CanvasEntity {
	constructor(x, y, radius, mass) {
		super(x, y, radius);
		this.mass = mass;
		this.dx = 5;
		this.dy = 0;
	}

	set(mass) {
		this.mass = mass;
	}
	render() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = "black";
		ctx.fill();
	}
	animate() {
		this.x += this.dx;
		this.y += this.dy;

		// wall bounces
		if (this.x + this.radius >= innerWidth || this.x - this.radius < 0) {
			this.dx = -this.dx;
		}
		if (this.y + this.radius >= innerHeight || this.y - this.radius < 0) {
			this.dy = -this.dy;
		}
		this.dy += 1;
	}
}

//Peg child class
class Peg extends CanvasEntity {
	constructor(x, y, radius) {
		super(x, y, radius);
		this.color = "blue";
	}

	render() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
	}
}

// Peg Board Array Initiator function
function initPegArray(num, radius) {
	const widthBetween = innerWidth / num;
	const heightBetween = innerHeight / num;
	const pegArray = [];
	for (let i = 0; i < num; i++) {
		for (let j = 0; j <= num; j++) {
			pegArray.push(
				new Peg(
					i * widthBetween + widthBetween / 2,
					j * heightBetween + heightBetween / 2,
					radius
				)
			);
		}
	}
	return pegArray;
}

// Peg Board Rendering function
function renderPegArray(pegArray, c) {
	pegArray.forEach((peg) => {
		hasCollided(c, peg);
		peg.render();
	});
}

/* ------------------------------ COLLISION DETECTION --------------------------------- */

//pythagorean theorem helper function
function computeDistance(x1, y1, x2, y2) {
	let xDistance = x2 - x1;
	let yDistance = y2 - y1;
	return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

//detect collision between circle and peg
function hasCollided(circle, peg) {
	if (
		computeDistance(circle.x, circle.y, peg.x, peg.y) <
		PEG_RADIUS + CIRCLE_RADIUS
	) {
		peg.color = "red";
	} else {
		peg.color = "blue";
	}
}

// object Instantiation
const circle = new Circle(100, 100, CIRCLE_RADIUS, 2);
const pegArray = initPegArray(4, PEG_RADIUS);

//animation loop
function animate() {
	ctx.clearRect(0, 0, innerWidth, innerHeight);
	circle.render();
	circle.animate();
	renderPegArray(pegArray, circle);
	requestAnimationFrame(animate);
}

animate();
