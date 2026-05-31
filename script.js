let allQuestions = [];
let questions = [];
let current = 0;
let answered = false;

let attempted = 0;
let correctCount = 0;
let wrongCount = 0;
let wrongQuestions = [];

// Load selected subject
const subjectFile = localStorage.getItem('subjectFile') || 'ent.json';
document.getElementById("quizTitle").innerText = subjectFile.replace('.json','').toUpperCase() + " Practice Quiz";

fetch(subjectFile)
  .then(res => res.json())
  .then(data => {
    allQuestions = data;

    // Shuffle questions
    questions = shuffleQuestions([...allQuestions]);

    // Shuffle options
    questions.forEach(q => {
      q.randomizedOptions = shuffleOptions(q.options);
    });

    loadQ();
  });

function shuffleQuestions(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleOptions(opts) {
  const arr = opts.map((o, i) => ({ text: o, index: i }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadQ() {
  answered = false;
  const q = questions[current];

  document.getElementById("questionBox").innerHTML =
    `<h3>${current + 1}. ${q.question}</h3>`;

  let html = "";
  q.randomizedOptions.forEach((optObj, i) => {
    if (optObj.text.trim() !== "") {
      html += `<div class="option" onclick="check(${i}, this)">
                ${optObj.text}
               </div>`;
    }
  });

  document.getElementById("optionsBox").innerHTML = html;
}

function check(index, el) {
  if (answered) return;
  answered = true;

  attempted++;

  const q = questions[current];
  const correctIndex = q.randomizedOptions.findIndex(o => o.index === 0);

  const options = document.querySelectorAll(".option");
  options[correctIndex].classList.add("correct");

  if (index === correctIndex) {
    correctCount++;
  } else {
    wrongCount++;
    el.classList.add("wrong");
    wrongQuestions.push({
      question: q.question,
      options: q.randomizedOptions.map(o => o.text),
      userChoice: index,
      correctIndex: correctIndex
    });
  }
}

function nextQ() {
  if (current < questions.length - 1) {
    current++;
    loadQ();
  } else {
    showResult();
  }
}

function prevQ() {
  if (current > 0) {
    current--;
    loadQ();
  }
}

function jumpQ() {
  const n = parseInt(document.getElementById("jumpInput").value);
  if (n >= 1 && n <= questions.length) {
    current = n - 1;
    loadQ();
  }
}

function showResult() {
  let html = `
    <h2>Result Summary</h2>
    <p><strong>Total Attempted:</strong> ${attempted}</p>
    <p><strong>Correct Answers:</strong> ${correctCount}</p>
    <p><strong>Wrong Answers:</strong> ${wrongCount}</p>
    <hr>
    <h3>Wrong Questions Review</h3>
  `;

  if (wrongQuestions.length === 0) {
    html += `<p>🎉 Excellent! No wrong answers.</p>`;
  } else {
    wrongQuestions.forEach((wq, i) => {
      html += `<div class="review-box">
                  <strong>${i + 1}. ${wq.question}</strong><br>
      `;
      wq.options.forEach((opt, idx) => {
        let style = "";
        if (idx === wq.correctIndex) style = "color:green; font-weight:bold;";
        if (idx === wq.userChoice) style += " color:red; font-weight:bold;";
        html += `<div class="review-option" style="${style}">
                  ${String.fromCharCode(65+idx)}. ${opt}
                 </div>`;
      });
      html += `</div>`;
    });
  }

  html += `<hr>
           <div style="text-align:center; margin-top:20px;">
             <button class="restart-btn" onclick="restartQuiz()">Restart Quiz</button>
           </div>`;

  html += `<hr>
           <div class="footer">
             <p><strong>All THE BEST</strong></p>
             <p>Officially Created By <strong>Prashant Vala</strong></p>
             <p class="disclaimer">
               Disclaimer:
             </p>
           </div>`;

  document.querySelector(".container").innerHTML = html;
}

function restartQuiz() {
  current = 0;
  answered = false;
  attempted = 0;
  correctCount = 0;
  wrongCount = 0;
  wrongQuestions = [];

  // Shuffle questions and options again
  questions = shuffleQuestions([...allQuestions]);
  questions.forEach(q => {
    q.randomizedOptions = shuffleOptions(q.options);
  });

  const container = document.querySelector(".container");
  container.innerHTML = `
    <h2 id="quizTitle">${subjectFile.replace('.json','').toUpperCase()} Practice Quiz</h2>
    <div id="questionBox"></div>
    <div id="optionsBox"></div>
    <div class="nav">
      <button onclick="prevQ()">Back</button>
      <button onclick="nextQ()">Next</button>
    </div>
    <div class="jump-center">
      <input type="number" id="jumpInput" placeholder="Enter question number">
      <button onclick="jumpQ()">Go</button>
    </div>
    <hr>
    <div class="footer">
      <p><strong>All the Best</strong></p>
      <p>Officially Created By <strong>Prashant Vala</strong></p>
      <p class="disclaimer">
        Disclaimer: .
      </p>
    </div>
  `;

  loadQ();
}
