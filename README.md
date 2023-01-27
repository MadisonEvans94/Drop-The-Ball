DROP THE BALL 

Welcome to the "Drop the Ball" project! This web application was created using vanilla JavaScript, HTML, and CSS, and it allows users to interact with a virtual peg board that is inspired by the famous Galton board.

What is a Galton Board?

A Galton board, also known as a quincunx, is a device that consists of a vertical board with a series of pegs or nails arranged in a triangular pattern. The board is filled with a large number of balls or beads, which are dropped from the top of the board. As the balls fall, they hit the pegs and bounce off in different directions, eventually landing in one of the bins at the bottom of the board. This project's implementation uses a uniform array of pegs, each with their own "number" attributes, which get added to a sum upon every ball collision. This sum is then sent to an external api and returns a series of trivia facts about that number. 

How to Use the Virtual Galton Board

The Virtual Galton Board allows users to drop virtual balls on the pegs and watch as they bounce and accumulate a different score. 

To use the Virtual Galton Board, simply open the application in your web browser and click on the board to activate the animation. You can also view the high scores by clicking on the "High Scores" button.

Installation

To run the application, you will need to have a web browser installed on your computer. Fork and clone this repo, and open the index.html file in your browser to run the application. To activate the high score functionality, be sure to launch the db.json file by entering "npx json-server --watch db.json" in the command line. 

Contribution
We welcome contributions to the Virtual Galton Board project. If you have any ideas or suggestions for improvements, please feel free to open an issue or pull request on the GitHub repository.

License
The Virtual Galton Board project is open-source and available under the MIT License.

Acknowledgments

We would like to thank Galton Board inventor Francis Galton for his inspiration and contributions to the field of statistics and probability.
