let baseUrl = `https://opentdb.com/api.php?amount=15&category=`;

let randomQuizBtn = document.getElementById("random-quiz-btn");

let categoryQuiz = document.querySelectorAll(".category");

let startQuizSection = document.getElementById("start-quiz-section");

let quizSection = document.getElementById("quiz-page");

let quizPageTitle = document.getElementById("quiz-page-question");

let questionDiv = document.getElementById("question-div");

let nextQuestionBtn = document.getElementById("next-btn");

let options = document.getElementById("options");

let currQuestionDiv = document.getElementById("curr-question-count-div");

let quiz = document.querySelector(".quiz");

let resPage = document.querySelector(".res-page");

// making other sections hidden
quizSection.style.display = "none";
resPage.style.display = "none";

//Making required variables
let currentQuestionIndex = 0;
let questionSet;
let score = 0;

let countDown = 20;
let slideInterval;
let countDownInterval;
let reveledAnswer = false;
let answer_optios_array;
let currQuesCorrAns;

//soundeffects
let start = new Audio("./audio_effects/start.mp3");
let wow = new Audio("./audio_effects/wow.mp3");
let correct = new Audio("./audio_effects/correct.mp3");
let happyhappy = new Audio("./audio_effects/happyhappy.mp3");
let wrong = new Audio("./audio_effects/wrong.mp3");
let fail = new Audio("./audio_effects/fail.mp3");
let clockcountdown = new Audio("./audio_effects/clockcountdown.mp3");
let timeout = new Audio("./audio_effects/timeout.mp3");

//fetching data
async function fetchQuestions(value) {
  let url = baseUrl + value;
  let data = await fetch(url);
  let result = await data.json();
  questionSet = result.results;
  startingQuiz(questionSet);
}

//Quiz functions
function startingQuiz(questionSet) {
  quizSection.style.display = "block";
  populateQuestions(questionSet);
}

function populateQuestions(questionSet) {
  if (currentQuestionIndex < questionSet.length) {
    let { question, correct_answer, incorrect_answers } =
      questionSet[currentQuestionIndex];
    currQuesCorrAns = correct_answer;
    currQuestionDiv.innerHTML = `
        <p class="text-xl"> ${
          currentQuestionIndex + 1
        } / <span class="text-red-500">${
      questionSet.length
    }</span> Questions</p>
    <p class="text-xl" id="timer-tag"></p>
    <p class="text-xl" id="score"> Score: ${score} / 15 </p>
    `;
    quizPageTitle.innerHTML = `
    <h2 class="text-xl font-bold mb-4 text-center tracking-wider text-white">
      ${question}
    </h2>
    `;
    startCountDown();
    options.innerHTML = "";
    let allOpt = [incorrect_answers.concat(correct_answer)];
    answer_optios_array = allOpt
      .flat()
      .slice()
      .sort(() => Math.random() - 0.5);
    populateOptions(answer_optios_array, correct_answer);
  } else {
    showResult();
  }

  function populateOptions(opt, correct_answer) {
    opt.forEach((answer, idx) => {
      options.innerHTML += `
      <div class="flex mx-10 flex-col bg-slate-200 hover:bg-slate-950 rounded-md transition duration-300 hover:scale-x-105">
        <p class="ans ans-${idx} h-max p-4 text-xl font-semibold text-black hover:text-white transition duration-300" val="${idx}">${answer}</p>
      </div>
    `;
    });
    let ansOpt = document.querySelectorAll(".ans");
    checkAndShowAns(opt, ansOpt, correct_answer);
  }

  function checkAndShowAns(opt, ansOpt, correct_answer) {
    let flag = true;
    ansOpt.forEach((ans) => {
      ans.addEventListener("click", () => {
        if (flag && !reveledAnswer) {
          flag = false;
          let index = ans.getAttribute("val");
          let check = checkAns(index, opt, correct_answer);
          if (check) {
            ans.parentNode.style.backgroundColor = "green";
            ans.style.color = "white";
            correct.play();
            stopCountDown();
            setTimeout(() => {
              goToNextQuestion();
            }, 1000);
          } else {
            wrong.play();
            ans.parentNode.style.backgroundColor = "red";
            ans.style.color = "white";
            let correctIndex = opt.findIndex((elem) => {
              return elem == correct_answer;
            });
            let elem = "ans-" + correctIndex;
            let correctAnswerDivs = document.querySelectorAll(`.${elem}`);
            correctAnswerDivs.forEach((div) => {
              div.parentNode.style.backgroundColor = "green";
              div.style.color = "white";
            });
            stopCountDown();
            setTimeout(() => {
              goToNextQuestion();
            }, 1000);
          }
        }
      });
    });
  }

  function checkAns(index, opt, correct_answer) {
    if (correct_answer == opt[index]) {
      score++;
      document.getElementById("score").innerText = `Socre: ${score} / 15`;
      return true;
    }
  }

  function showResult() {
    resPage.innerHTML = `
    <div class="flex flex-col items-center justify-center h-[80vh] bg-gray-800">
    <p class="text-white text-3xl mb-4">Your Score is</p>
    <div class="w-40 h-40 rounded-full bg-gray-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-8">
    <span class="${
      score > 5 ? "text-green-500" : "text-red-500"
    }">${score}</span>
    <span class="ml-2">/ 15</span>
    </div>
    <div class="bg-gray-900 p-4 rounded-lg shadow-md">
    <button class="text-white font-bold py-2 px-4 border border-white rounded hover:bg-gray-700" id="back-to-home">Back to Home</button>
    </div>
    </div> 
    `;
    if (score < 5) {
      fail.play();
    } else if (score < 11) {
      wow.play();
    } else {
      happyhappy.play();
    }
    quizSection.style.display = "none";
    resPage.style.display = "block";
    document.getElementById("back-to-home").addEventListener("click", () => {
      score = 0;
      currentQuestionIndex = 0;
      quizSection.style.display = "none";
      resPage.style.display = "none";
      startQuizSection.style.display = "block";
    });
  }
}

function revelAnswer() {
  reveledAnswer = true;
  let correctIndex = answer_optios_array.findIndex((elem) => {
    return elem == currQuesCorrAns;
  });
  let elem = "ans-" + correctIndex;
  let correctAnswerDivs = document.querySelectorAll(`.${elem}`);
  correctAnswerDivs.forEach((div) => {
    div.parentNode.style.backgroundColor = "green";
    div.style.color = "white";
  });
}

function startCountDown() {
  updateTimerDisplay(countDown);
  slideInterval = setInterval(goToNextQuestion, 23000);
  countDownInterval = setInterval(() => {
    countDown -= 1;
    if (countDown === 0) {
      clockcountdown.pause();
      timeout.play();
    }
    if (countDown < 0) {
      revelAnswer();
    }
    updateTimerDisplay(countDown);
  }, 1000);
}

function stopCountDown() {
  clockcountdown.pause();
  clockcountdown.currentTime = 0;
  slideInterval !== undefined ? clearInterval(slideInterval) : null;
  if (countDownInterval !== undefined) {
    clearInterval(countDownInterval);
    countDown = 20;
  }
}

function updateTimerDisplay(timeLeft) {
  if (timeLeft >= 0) {
    let timerTag = document.getElementById("timer-tag");
    timerTag.innerHTML = `
      <span class="text-xl ${
        timeLeft < 10 ? "text-red-500" : "text-green-500"
      }">${timeLeft} Sec</span>
    `;
    if (timeLeft === 10) {
      clockcountdown.loop = true;
      clockcountdown.play();
    }
  }
}

//Event Listener Section
randomQuizBtn.addEventListener("click", () => {
  let value = randomQuizBtn.getAttribute("val");
  startQuizSection.style.display = "none";
  start.play();
  fetchQuestions(value);
});

categoryQuiz.forEach((category) => {
  category.addEventListener("click", () => {
    let value = category.getAttribute("val");
    startQuizSection.style.display = "none";
    start.play();
    fetchQuestions(value);
  });
});

nextQuestionBtn.addEventListener("click", () => {
  stopCountDown();
  goToNextQuestion();
});
function goToNextQuestion() {
  stopCountDown();
  currentQuestionIndex++;
  populateQuestions(questionSet);
}
