//////////////CLASS DEFINITIONS/////////////////
class scoreEntry {
	constructor(name, score, dateTime) {
		this.name = name;
		this.score = score;
		this.dateTime = dateTime;
	}
}
class highScoresList {
	/**
	 * 
	 * @param {Array<scoreEntry>} scores 
	 */
	constructor(scores) {
		this.scores = scores;
		this.scores.sort((score1, score2) => score2.score - score1.score);
		this.renderScores();
	}

	/**
	 * 
	 * @param {Number} score 
	 * @returns {boolean}
	 */
	isTop10Score(score) {
		return this.scores.length < 10 || score > this.scores[9].score;
}
	/**
	 * 
	 * @param {scoreEntry} score 
	 */
	addScore(score) {
		this.scores.push(score)
		this.scores.sort((a,b) => b.score - a.score);
        this.renderScores();

		//update the server. Note if this fails, nobody really cares bc it's a demo project
		postJSON(highScoresURL, score);
	}
	
    renderScores() {
        const scoresTable = document.querySelector('#high-scores-table');

		//clear out the current table
        scoresTable.innerHTML = 
			`<tr>
				<th>Name</th>
				<th>Score</th>
				<th>Date</th>
			</tr>`;

		//recreate table with new scores. Note scores are sorted in descending order
        this.scores.forEach(score => {
            const tr = document.createElement('tr');
			
			const tdName = document.createElement('td');
			tdName.textContent = score.name;

			const tdScore = document.createElement('td');
			tdScore.textContent = score.score;

			const tdDate = document.createElement('td');
			tdDate.textContent = score.dateTime;

			tr.append(tdName, tdScore, tdDate);
			scoresTable.append(tr);
        });
    }
}
/////////////////////////////////////////


//wire up all parts of high scores div
const modal = document.querySelector('#high-scores-modal');
const span = document.querySelector('.close');
const form = document.querySelector('#new-score-form');
const highScoresButton = document.querySelector('.btn');

highScoresButton.addEventListener('click', e => {
	const highScoresTable = document.querySelector('#high-scores-table');
	if(highScoresTable.classList.contains('hidden')) {
		highScoresTable.classList.remove('hidden');
		e.target.textContent = 'Hide High Scores';
	}
	else {
		e.target.textContent = "Show High Scores";
		highScoresTable.classList.add("hidden");
	}
})

span.addEventListener('click', function() {
	modal.style.display = "none";
});

form.addEventListener('submit', e => {
	e.preventDefault();
	const modal = document.querySelector('#high-scores-modal');
	modal.style.display = "block";

	let now = new Date();
	scoreList.addScore(new scoreEntry(e.target.name.value, sum, now.toLocaleString()));
	e.target.reset();
	modal.style.display = "none";
});
