//Global constants and variables
const PEG_COLOR = "black";
const CIRCLE_RADIUS = 30;
const PEG_RADIUS = 18;
let sequenceSum = 0;
const DAMPER = 0.95;
const PEG_NUM = 5;

const CIRCLE_MASS = 0.3;
const CANVAS_COLOR = "rgba(0,0,0,0)";
let mousePos;
const MAX_NUM = 50; // maximum value of number attribute within a peg

//gravity globals
let isGravityEnabled = false;
let gravity = 0;

// Canvas Setup
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

//IIFE for initializing the canvas settings on load
(function initCanvas() {
	canvas.width = 800;
	canvas.height = 800;
	ctx.font = "30px Arial";
})();

const XSTART = canvas.width / 2 + 10;
const YSTART = CIRCLE_RADIUS;
const leftWall = (innerWidth - canvas.width) / 2;
const rightWall = (innerWidth - canvas.width) / 2 + canvas.width;
// event listeners
canvas.addEventListener("mousemove", (e) => {
	mousePos = e.offsetX;
});
canvas.addEventListener("click", () => toggleGravity());

//gravity toggler helper function
function toggleGravity() {
	console.log("gravity toggled", gravity);
	isGravityEnabled = !isGravityEnabled;
	if (isGravityEnabled) {
		gravity = 1;
	} else {
		gravity = -1;
	}
}
/* ------------------------------------- CLASSES ---------------------------------------- */
// Canvas Entity super class for any physical element within the canvas (ball and pegs + anything else we might add later)
class CanvasEntity {
	constructor(x, y, radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;
	}
}

//Circle class (extends canvas entity)
class Circle extends CanvasEntity {
	constructor(x, y, radius, mass) {
		super(x, y, radius);
		this.mass = mass;
		this.dx = 0;
		this.dy = 0;
		this.color = "white";
	}

	draw() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
	}

	update() {
		this.x += this.dx;
		this.y += this.dy;

		// wall bounces
		if (this.x + this.radius >= canvas.width || this.x - this.radius < 0) {
			this.dx = -this.dx;
		}
		if (this.y - this.radius < 0) {
			this.dy = -this.dy;
		}
		this.dy += gravity * this.mass;
	}
	reset() {
		this.x = XSTART;
		this.y = YSTART;
		this.dy = 0;
		this.dx = 0;
	}
	getAngle() {
		return Math.atan2(this.dy / this.dx);
	}
	getSpeed() {
		return Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
	}
}

//Peg class (extends canvas entity)
class Peg extends CanvasEntity {
	constructor(x, y, radius, number, mass = 10) {
		super(x, y, radius);
		this.color = "black";
		this.number = number;
		this.mass = mass;
		this.dx = 0;
		this.dy = 0;
		this.showText = false;
		this.contactFlag = false;
		this.animationCounter = 0;
	}
	showNumber() {
		this.animationCounter = 0;
		this.showText = true;
	}

	draw() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		if (this.showText && this.animationCounter < 50) {
			ctx.fillStyle = "white";
			ctx.fillText(`+${this.number}`, this.x, this.y - this.animationCounter);
			this.animationCounter++;
		}

		// if (this.showText) {
		// 	this.displayNumber();
		// }
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

/* ------------------------------------- PEG ARRAY SETUP ---------------------------------------- */

// Peg Board Array Initiator function. Builds the instances of each peg within the peg board array
function initPegArray(num, radius) {
	const widthBetween = 0.9 * (canvas.width / num);
	const heightBetween = canvas.height / num;
	const pegArray = [];
	let offset = 0;
	for (let i = 0; i < num - 1; i++) {
		for (let j = 0; j < num; j++) {
			pegArray.push(
				new Peg(
					//order of i and j here matters... switched here so that the arrangement offsets correctly
					j * widthBetween + widthBetween / 2 + offset,
					i * heightBetween + heightBetween / 2 + CIRCLE_RADIUS * 2,
					radius,

					//creates random ints between 1-9 for number attribute within each peg
					Math.floor(Math.random() * MAX_NUM + 1)
				)
			);
		}
		if (i % 2 == 0) {
			offset += widthBetween / 2;
		} else {
			offset -= widthBetween / 2;
		}
	}
	return pegArray;
}

function resetPegArray(pegArray) {
	pegArray.forEach((peg) => {
		peg.number = Math.floor(Math.random() * MAX_NUM + 1);
		peg.contactFlag = false;
		peg.showText = false;
	});
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
/* ------------------------------------- RESET FUNCTIONALITY --------------------------------*/

// Resets the board and reshuffles peg numbers
function reset() {
	gravity = 0;
	sequenceSum = 0;
	isGravityEnabled = false;
	circle.reset();
	resetPegArray(pegArray);
	resetResult();
	animate();
}
/* ------------------------------------- ANIMATION LOOP ----------------------------------------------- */
function refreshCanvas() {
	ctx.clearRect(0, 0, innerWidth, innerHeight);
	ctx.fillStyle = CANVAS_COLOR;
	ctx.fillRect(0, 0, innerWidth, innerHeight);
}
function animate() {
	console.log("animation");
	//if the ball reaches the bottom of the canvas, then break out of the animation loop and return/log the sequence array
	if (circle.y - 2 * circle.radius > canvas.height) {
		queryDb(sequenceSum);
		//delete circle;
		return;
	}

	//refreshes the canvas between renders
	refreshCanvas();

	//conditional for circle state before gravity is enabled
	if (!isGravityEnabled) {
		circle.x = mousePos * 1;
		if (circle.x + circle.radius > canvas.width) {
			circle.x = canvas.width - circle.radius;
		} else if (circle.x - circle.radius < 0) {
			circle.x = circle.radius;
		}
	}

	//draw and update the circle in DOM
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
		// and if peg hasn't flagged a collision yet
		if (peg.contactFlag === false) {
			//do this...
			peg.color = "red";

			let angle = computeAngle(circle.x, circle.y, peg.x, peg.y);
			resolveCollision(circle, peg, angle);
			peg.showNumber();
			sequenceSum += peg.number;
		}
		peg.contactFlag = true;
	} else {
		// if there is not a collision, then reset color back to default color...
		peg.color = "black";
		peg.contactFlag = false;
	}
}

/* ------------------------------------- PHYSICS IMPLEMENTATION ---------------------------------------- */

//rotater function: a helper function to simplify the "Newtonian 1D momentum" equations
function rotate(dx, dy, angle) {
	//returns object containing velocity vector projected onto the x axis
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

	//conditional prevents circle overlapping bug
	if (xVelocityDiff * xDist + yVelocityDiff * yDist > 0) {
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

		//swap circle velocities for realistic bounce effect (damper added so that motion converges)
		circle.dx = vResult1.x * DAMPER;
		circle.dy = vResult1.y * DAMPER;

		//Peg velocity update (note: the sim still works without multiplying peg velocity by zero. including *0 to be safe)
		peg.dx = vResult2.x * 0;
		peg.dy = vResult2.y * 0;
	}
}
