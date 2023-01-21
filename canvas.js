//Global constants and variables
const PEG_COLOR = "black";
const CIRCLE_RADIUS = 30;
const PEG_RADIUS = 15;
const sequenceArray = [];
const DAMPER = 0.9;
const PEG_NUM = 5;
const XSTART = innerWidth / 2 + 10;
const YSTART = CIRCLE_RADIUS + 1;
const CIRCLE_MASS = 0.1;
let isActive = true;
let mousePos;

//gravity globals
let isGravityEnabled = false;
let gravity = 0;

// Canvas Setup
const canvas = document.querySelector("canvas");
const container = document.querySelector(".canvas-container");
const ctx = canvas.getContext("2d");

//IIFE for initializing the canvas settings on load
(function initCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
})();

// event listeners
canvas.addEventListener("mousemove", (e) => {
	mousePos = e.screenX;
});
canvas.addEventListener("click", () => toggleGravity());

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
	draw() {
		console.log("this element does not have a concrete render method");
	}
}

//gravity toggler helper function
function toggleGravity() {
	console.log("gravity toggled", gravity);
	isGravityEnabled = !isGravityEnabled;
	if (isGravityEnabled) {
		gravity = 1;
	} else {
		gravity = 0;
	}
}

//Circle class (extends canvas entity)
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
	draw() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = "black";
		ctx.fill();
	}

	update() {
		this.x += this.dx;
		this.y += this.dy;

		// wall bounces
		if (this.x + this.radius >= innerWidth || this.x - this.radius < 0) {
			this.dx = -this.dx;
		}
		if (this.y + this.radius >= innerHeight || this.y - this.radius < 0) {
			this.dy = -this.dy;
		}

		this.dy += gravity * this.mass;
	}
}

//Peg class (extends canvas entity)
class Peg extends CanvasEntity {
	constructor(x, y, radius, number, mass = 10) {
		super(x, y, radius);
		this.color = "blue";
		this.number = number;
		this.mass = mass;
		this.dx = 0;
		this.dy = 0;
	}

	draw() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
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

// Peg Board Array Initiator function. Builds the instances of each peg within the peg board array
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

// Peg Board Rendering function. Renders peg array to DOM. Note that function requires reference to circle object in order to handle collision functions
function renderPegArray(pegArray, circle) {
	pegArray.forEach((peg) => {
		//at each animation frame, checks each peg in array to see if it has collided with ball
		hasCollided(circle, peg);

		//updates each peg in the DOM
		peg.draw();
	});
}

/* ------------------------------------- OBJECT INSTANTIATION ---------------------------------------- */

const circle = circleFactory.build();

let pegArray = initPegArray(PEG_NUM, PEG_RADIUS);

circle.draw();
renderPegArray(pegArray, circle);

/* ------------------------------------- ANIMATION LOOP ----------------------------------------------- */
function refreshCanvas() {
	ctx.clearRect(0, 0, innerWidth, innerHeight);
}

function animate() {
	//if the user changes isActive to falsy, then break out of the animation loop
	if (!isActive) {
		return;
	}

	//if the ball reaches the bottom of the canvas, then break out of the animation loop and return/log the sequence array
	if (circle.y + circle.radius > innerHeight * 0.99) {
		alert(sequenceArray);
		return `YOUR SEQUENCE IS ${sequenceArray}`;
	}

	//refreshes the canvas between renders
	refreshCanvas();

	//conditional for circle state before gravity is enabled
	if (!isGravityEnabled) {
		/*

		TODO: circle position is controlled by event listener mouse scroll 

		*/
		circle.x = mousePos;
	}

	//update and animate the circle
	circle.draw();
	circle.update();

	//render the peg states with respect to the circle object
	renderPegArray(pegArray, circle);

	//perform browser rendering of frame
	requestAnimationFrame(animate);
}
animate();

/* ------------------------------------- COLLISION DETECTION ---------------------------------------- */

//pythagorean theorem helper function

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

/* ------------------------------------- PHYSICS IMPLEMENTATION ---------------------------------------- */

//rotater function is a helper function to simplify the "Newtonian 1D momentum" equations
function rotate(dx, dy, angle) {
	//returns velocity vector projected onto the x dimension
	return {
		x: dx * Math.cos(angle) - dy * Math.sin(angle),
		y: dx * Math.sin(angle) + dy * Math.cos(angle),
	};
}

//resolver for handling the physics outputs
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
