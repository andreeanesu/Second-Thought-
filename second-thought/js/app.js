/**
 * app.js
 * Boots the app: load data → start session → wire UI events.
 */

import { loadQuizData } from "./data-loader.js";
import { QuizEngine } from "./quiz-engine.js";
import { QuizUI } from "./ui.js";

const elements = {
  main: document.getElementById("main"),
  quizScreen: document.getElementById("quiz-screen"),
  finishScreen: document.getElementById("finish-screen"),
  scenario: document.getElementById("scenario"),
  answers: document.getElementById("answers"),
  feedback: document.getElementById("feedback"),
  feedbackVerdict: document.getElementById("feedback-verdict"),
  feedbackExplanation: document.getElementById("feedback-explanation"),
  feedbackWhyHumans: document.getElementById("feedback-why-humans"),
  feedbackReflection: document.getElementById("feedback-reflection"),
  progressFill: document.getElementById("progress-fill"),
  progressLabel: document.getElementById("progress-label"),
  footerCategory: document.getElementById("footer-category"),
  btnNext: document.getElementById("btn-next"),
  btnRestart: document.getElementById("btn-restart"),
};

const ui = new QuizUI(elements);
let engine;

function renderCurrentQuestion() {
  const challenge = engine.getCurrentChallenge();
  if (!challenge) return;
  ui.renderQuestion(challenge, engine.getProgress());
}

function handleAnswer(letter) {
  const result = engine.selectAnswer(letter);
  if (!result) return;
  ui.showFeedback(result);
}

function handleNext() {
  if (!engine.canGoNext()) return;

  engine.goNext();

  if (engine.isFinished()) {
    ui.showFinishScreen();
    return;
  }

  renderCurrentQuestion();
}

function startNewRound() {
  engine.startSession();
  renderCurrentQuestion();
}

async function init() {
  try {
    const data = await loadQuizData();
    engine = new QuizEngine(data.challenges);
    engine.startSession();

    ui.bindAnswerHandler(handleAnswer);
    elements.btnNext.addEventListener("click", handleNext);
    elements.btnRestart.addEventListener("click", startNewRound);

    renderCurrentQuestion();
  } catch (error) {
    console.error(error);
    elements.quizScreen.classList.add("hidden");
    elements.finishScreen.classList.remove("hidden");
    elements.finishScreen.innerHTML = `
      <h2>Could not load quiz content</h2>
      <p class="error-message">
        Please run the app through a local server
        (for example: <code>python3 -m http.server 8080</code>)
        and open <code>http://localhost:8080</code>.
      </p>
    `;
  }
}

init();
