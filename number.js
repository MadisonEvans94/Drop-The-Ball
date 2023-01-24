const resultDiv = document.querySelector("#trivia");

//helper methods
function queryDb(number) {
	getJSON(`http://numbersapi.com/${number}?json`).then(renderResult);
	getJSON(`http://numbersapi.com/${number}/year?json`).then(renderResult);
	getJSON(`http://numbersapi.com/${number}/math?json`).then(renderResult);
}

function getJSON(url) {
	return fetch(url)
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw "Error fetching resources. Status code: " + response.status;
			}
		})
		.catch((errorMsg) => console.log(errorMsg));
}

function renderResult(data) {
	insertResultsHeaderIfNotPresent();
	if (data.found) {
		const p = document.createElement("p");
		p.className = "result";
		p.textContent = data.text;
		resultDiv.append(p);
	}
}

function insertResultsHeaderIfNotPresent() {
	if (!resultDiv.contains(resultDiv.querySelector("h2"))) {
		const heading = document.createElement("h2");
		heading.textContent = "Results";
		resultDiv.append(heading);
	}
}
