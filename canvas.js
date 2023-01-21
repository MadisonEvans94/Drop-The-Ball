//Global constants
const PEG_COLOR = "black";
const CIRCLE_RADIUS = 30;
const PEG_RADIUS = 15;
const sequenceArray = [];
const DAMPER = 0.9;
const PEG_NUM = 5;
const XSTART = 80;
const YSTART = 50;
const CIRCLE_MASS = 1;

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
	update() {
		console.log("this element does not have a concrete render method");
	}
}

//Circle child class
class Circle extends CanvasEntity {
	constructor(x, y, radius, mass) {
		super(x, y, radius);
		this.mass = mass;
		this.dx = 0;
		this.dy = 0;
	}

	set(mass) {
		this.mass = mass;
	}
	update() {
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

		//gravity
		this.dy += 0.1;
	}
}

//circle factory (if we want to modulate the types of shapes we use, then we can make a factory parent class and just have other builders extend from that...)
class CircleFactory {
	constructor(xstart, ystart, radius, mass) {
		this.xstart = xstart;
		this.ystart = ystart;
		this.radius = radius;
		this.mass = mass;
	}

	build() {
		return new Circle(this.xstart, this.ystart, this.radius, this.mass);
	}
}

//circle factory instantiation using global constants as macro controls
const circleFactory = new CircleFactory(
	XSTART,
	YSTART,
	CIRCLE_RADIUS,
	CIRCLE_MASS
);

//Peg child class
class Peg extends CanvasEntity {
	constructor(x, y, radius, number, mass = 10) {
		super(x, y, radius);
		this.color = "blue";
		this.number = number;
		this.mass = mass;
		this.dx = 0;
		this.dy = 0;
	}

	update() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
	}
}

// Peg Board Array Initiator function
/*
	TODO: offset pegs 
*/
function initPegArray(num, radius) {
	const widthBetween = innerWidth / num;
	const heightBetween = innerHeight / num;
	const pegArray = [];
	let offset = -widthBetween / 2;
	for (let i = 0; i < num; i++) {
		offset += widthBetween / 2;
		for (let j = 0; j <= num; j++) {
			pegArray.push(
				new Peg(
					j * widthBetween + widthBetween / 2 + offset,
					i * heightBetween + heightBetween / 2,
					radius,

					//creates random ints between 1-9 for each peg
					Math.floor(Math.random() * 9 + 1)
				)
			);
		}
		offset -= widthBetween;
	}
	return pegArray;
}

// Peg Board Rendering function. Note that function requires reference to circle object in order to handle collision functions
function renderPegArray(pegArray, circle) {
	pegArray.forEach((peg) => {
		//at each animation frame, checks each peg in array to see if it has collided with ball
		hasCollided(circle, peg);

		//updates each peg in the DOM
		peg.update();
	});
}

/* ------------------------------ OBJECT INSTANTIATION --------------------------------- */

//Main Circle Object

const circle = circleFactory.build();

const pegArray = initPegArray(PEG_NUM, PEG_RADIUS);
circle.update();
renderPegArray(pegArray, circle);

/* ------------------------------ ANIMATION LOOP --------------------------------- */

function animate() {
	//if the user changes isActive to falsy, then break out of the animation loop
	if (!isActive) {
		return;
	}

	//if the ball reaches the bottom of the canvas, then break out of the animation loop and return/log the sequence array
	if (circle.y + circle.radius > innerHeight * 0.99) {
		console.log(sequenceArray);
		return sequenceArray;
	}

	//refreshes the canvas between renders
	ctx.clearRect(0, 0, innerWidth, innerHeight);

	//update and animate the circle
	circle.update();
	circle.animate();

	//render the peg states with respect to the circle object
	renderPegArray(pegArray, circle);

	//perform browser rendering of frame
	requestAnimationFrame(animate);
}

/* ------------------------------ COLLISION DETECTION --------------------------------- */

//pythagorean theorem helper function
/* 
	TODO: Combine computeDistance and computeAngle into one "pythag" function that returns an object containing distance and angle
*/
function computeDistance(x1, y1, x2, y2) {
	//X and Y distances between point 1 and point 2
	let xDistance = x2 - x1;
	let yDistance = y2 - y1;
	//Hypotenuse between point 1 and point 2
	return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// calculates angle between two entities that have collided
function computeAngle(x1, y1, x2, y2) {
	return -Math.atan2(y2 - y1, x2 - x1);
}

//rotater function is a helper function to simplify the "Newtonian 1D momentum" equations
function rotate(dx, dy, angle) {
	//returns velocity vector projected onto the x dimension
	return {
		x: dx * Math.cos(angle) - dy * Math.sin(angle),
		y: dx * Math.sin(angle) + dy * Math.cos(angle),
	};
}

//detect collision between circle and peg
function hasCollided(circle, peg) {
	if (
		//if there is a collision between current peg and circle...
		computeDistance(circle.x, circle.y, peg.x, peg.y) <
		circle.radius + peg.radius
	) {
		//do this...
		peg.color = "red";
		let angle = computeAngle(circle.x, circle.y, peg.x, peg.y);
		resolveCollision(circle, peg, angle);
		sequenceArray.push(peg.number);
	} else {
		// if there is not a collision, then do this...
		peg.color = "blue";
	}
}

//all physics logic dealing with what happens in a collsion goes here:
function resolveCollision(circle, peg, angle) {
	//difference in velocities of circle and peg
	const xVelocityDiff = circle.dx - peg.dx;
	const yVelocityDiff = circle.dy - peg.dy;

	//difference in distance between circle and peg
	const xDist = peg.x - circle.x;
	const yDist = peg.y - circle.y;

	//masses of circle and peg
	const m1 = circle.mass;
	const m2 = peg.mass;

	//prevent circle overlapp
	if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
		//circle and peg velocity objects after 1 dimensional projection
		const u1 = rotate(circle.dx, circle.dy, angle);
		const u2 = rotate(peg.dx, peg.dy, angle);

		//newtonian equations for conservation of momentum between elastic bodies
		const v1 = {
			x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
			y: u1.y,
		};
		const v2 = {
			x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
			y: u2.y,
		};

		//re-projecting velocities back into original axis
		const vResult1 = rotate(v1.x, v1.y, -angle);
		const vResult2 = rotate(v2.x, v2.y, -angle);

		//swap circle velocities for realistic bounce effect
		circle.dx = vResult1.x * DAMPER;
		circle.dy = vResult1.y * DAMPER;

		//note: the sim still works without multiplying peg velocity by zero. including *0 to be safe
		peg.dx = vResult2.x * 0;
		peg.dy = vResult2.y * 0;
	}
}
