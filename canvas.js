//Global constants
const PEG_COLOR = "black";

// Canvas Setup
const canvas = document.querySelector("canvas");
const container = document.querySelector(".canvas-container");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.9;
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
	}

	render() {
		ctx.fillStyle = "black";
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
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

//Peg Board Rendering function
function renderPegArray(pegArray) {
	pegArray.forEach((peg) => peg.render());
}

/* ------------------------------ COLLISION DETECTION --------------------------------- */
function computeDistance(x1, y1, x2, y2) {
	let xDistance = x2 - x1;
	let yDistance = y2 - y1;
	return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// object Instantiation
const circle = new Circle(100, 100, 20, 2);
const pegArray = initPegArray(4, 20);

//animation loop
function animate() {
	ctx.clearRect(0, 0, innerWidth, innerHeight);
	renderPegArray(pegArray);
	circle.render();
	circle.animate();
	requestAnimationFrame(animate);
}

animate();
