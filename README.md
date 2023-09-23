
# Drop The Ball

Drop The Ball is a web application built using vanilla JavaScript, HTML, and CSS. Inspired by the Galton board, this interactive virtual peg board allows users to engage with probability and statistics in a fun way. The application also integrates with an external API to provide trivia facts based on the sum of "number" attributes from peg collisions.

## Features

* Interactive virtual peg board mimicking a Galton board
* Real-time ball collision and score accumulation
* Integration with an external API for trivia facts
* High score functionality
* Client-side implementation

## How it Works

* Open the application in a web browser.
* Click on the board to activate the ball-drop animation.
* Balls collide with pegs, accumulating a score based on peg "number" attributes.
* The sum score is sent to an external API, which returns trivia facts about that number.
* High scores can be viewed by clicking the "High Scores" button.

## Installation

1. Fork and clone this repository.
2. Open `index.html` in your web browser.
3. To enable high score functionality, run `npx json-server --watch db.json` in your command line.

## Contributing

We welcome contributions to improve Drop The Ball! Feel free to open an issue or pull request on GitHub for:

* Additional features or improvements
* Bug fixes
* Performance enhancements

### Contributing Guidelines

1. Fork the repository on GitHub.
2. Clone the forked repository to your local machine.
   ```bash
   git clone https://github.com/yourusername/Drop-The-Ball.git
   ```
3. Install any required dependencies.
   ```bash
   npm install
   ```
4. Make your changes and test them.
5. Commit and push your changes.
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin your-feature-branch
   ```
6. Open a pull request with a clear description of your changes.

## License

This project is open-source and available under the MIT License.

