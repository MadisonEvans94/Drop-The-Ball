//Global constants
const PEG_COLOR = "black";
const CIRCLE_RADIUS = 30;
const PEG_RADIUS = 10;
const sequenceArray = [];
const DAMPER = 0.9;
const PEG_NUM = 5;
let sum = 0;

// Canvas Setup
const canvas = document.querySelector("canvas");
const container = document.querySelector(".canvas-container");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
let isActive = false;

// event listeners
const stopButton = document.createElement("button");
stopButton.textContent = "Stop";

stopButton.addEventListener("click", (e) => {
	console.log("this button has not been configured yet");
});

document.body.append(stopButton);

canvas.addEventListener("mousemove", (e) => {
	//console.log(e.screenX, e.screenY);
});

canvas.addEventListener("click", () => {
	isActive = !isActive;
	if (isActive) {
		animate();
	}
});

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
	constructor(x, y, radius, mass = 1) {
		super(x, y, radius);
		this.mass = mass;
		this.dx = 3;
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
		//top collision
		if (this.y - this.radius < 0) {
			this.dy = -this.dy;
		}
		if (this.y + this.radius >= canvas.height) {
			isActive = false;
			delete this;
		}
		//gravity
		this.dy += 0.1;
	}
}

//Peg child class
class Peg extends CanvasEntity {
	constructor(x, y, radius, number, mass = 1000) {
		super(x, y, radius);
		this.color = "blue";
		this.number = number;
		this.mass = mass;
		this.dx = 0;
		this.dy = 0;
	}

	render() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.fillText(this.number, this.x - 2, this.y + 25);
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
					radius,
					Math.floor(Math.random() * 9 + 1)
				)
			);
		}
	}
	return pegArray;
}

// Peg Board Rendering function
function renderPegArray(pegArray, circle) {
	pegArray.forEach((peg) => {
		hasCollided(circle, peg);
		peg.render();
	});
}

/* ------------------------------ OBJECT INSTANTIATION --------------------------------- */

const circle = new Circle(innerWidth / 3, CIRCLE_RADIUS * 2, CIRCLE_RADIUS, 1);
const pegArray = initPegArray(PEG_NUM, PEG_RADIUS);
circle.render();
renderPegArray(pegArray, circle);

/* ------------------------------ COLLISION DETECTION --------------------------------- */

//pythagorean theorem helper function
function computeDistance(x1, y1, x2, y2) {
	let xDistance = x2 - x1;
	let yDistance = y2 - y1;
	return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// calculates angle between two entities that have collided
function computeAngle(x1, y1, x2, y2) {
	return -Math.atan2(y2 - y1, x2 - x1);
}
//rotater helper function
function rotate(dx, dy, angle) {
	return {
		x: dx * Math.cos(angle) - dy * Math.sin(angle),
		y: dx * Math.sin(angle) + dy * Math.cos(angle),
	};
}
//detect collision between circle and peg
function hasCollided(circle, peg) {
	if (
		computeDistance(circle.x, circle.y, peg.x, peg.y) <
		circle.radius + peg.radius
	) {
		peg.color = "red";
		let angle = computeAngle(circle.x, circle.y, peg.x, peg.y);
		resolveCollision(circle, peg, angle);
		sum += peg.number;
		console.log(sum);
		sequenceArray.push(peg.number);
	} else {
		peg.color = "blue";
	}
}

function resolveCollision(circle, peg, angle) {
	const xVelocityDiff = circle.dx - peg.dx;
	const yVelocityDiff = circle.dy - peg.dy;

	const xDist = peg.x - circle.x;
	const yDist = peg.y - circle.y;

	const m1 = circle.mass;
	const m2 = peg.mass;

	//prevent circle overlapp
	if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
		//velocity before calculations
		const u1 = rotate(circle.dx, circle.dy, angle);
		const u2 = rotate(peg.dx, peg.dy, angle);

		//velocity after calculations
		const v1 = {
			x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
			y: u1.y,
		};
		const v2 = {
			x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
			y: u2.y,
		};

		//rotating the axis back to original state
		const vFinal1 = rotate(v1.x, v1.y, -angle);
		const vFinal2 = rotate(v2.x, v2.y, -angle);

		//swap circle velocities for realistic bounce effect
		circle.dx = vFinal1.x * DAMPER;
		circle.dy = vFinal1.y * DAMPER;

		peg.dx = vFinal2.x;
		peg.dy = vFinal2.y;
	}
}

//animation loop
function animate() {
	if (!isActive) {
		queryDb(sum);
		return;
	};

	ctx.clearRect(0, 0, innerWidth, innerHeight);
	circle.render();
	circle.animate();
	renderPegArray(pegArray, circle);
	requestAnimationFrame(animate);
}

/*
TODO: 

1. elastic collision detection
2. "drop" state handler on click 
3. array creation 
*/
