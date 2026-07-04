/**
 * app.js
 * Boots the app: load data → start screen → quiz → finish.
 */

import { loadQuizData, getPlayModes } from "./data-loader.js";
import { QuizEngine } from "./quiz-engine.js";
import { QuizUI } from "./ui.js";

const elements = {
  main: document.getElementById("main"),
  startScreen: document.getElementById("start-screen"),
  tierOptions: document.getElementById("tier-options"),
  quizScreen: document.getElementById("quiz-screen"),
  finishScreen: document.getElementById("finish-screen"),
  scenario: document.getElementById("scenario"),
  answers: document.getElementById("answers"),
  feedback: document.getElementById("feedback"),
  feedbackVerdict: document.getElementById("feedback-verdict"),
  feedbackWhyHumans: document.getElementById("feedback-why-humans"),
  feedbackReflection: document.getElementById("feedback-reflection"),
  questionProgress: document.getElementById("question-progress"),
  footerCategory: document.getElementById("footer-category"),
  btnNext: document.getElementById("btn-next"),
  btnRestart: document.getElementById("btn-restart"),
  btnChangeTier: document.getElementById("btn-change-tier"),
  finishTitle: document.getElementById("finish-title"),
  finishMessage: document.getElementById("finish-message"),
  finishScore: document.getElementById("finish-score"),
  quizCharacter: document.getElementById("quiz-character"),
  finishCharacter: document.getElementById("finish-character"),
};

const ui = new QuizUI(elements);
const playModes = getPlayModes();
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
    ui.showFinishScreen(engine.getSessionMeta(), engine.getRoundScore(), playModes);
    return;
  }

  renderCurrentQuestion();
}

function startRound(mode) {
  engine.setMode(mode);
  engine.startSession();
  renderCurrentQuestion();
}

function startNewRound() {
  startRound(engine.mode);
}

function showLevelPicker() {
  ui.showStartScreen(engine.getAllProgressSummaries(), playModes, startRound);
}

async function init() {
  try {
    const data = await loadQuizData();
    engine = new QuizEngine(data.challenges);

    ui.bindAnswerHandler(handleAnswer);
    elements.btnNext.addEventListener("click", handleNext);
    elements.btnRestart.addEventListener("click", startNewRound);
    elements.btnChangeTier.addEventListener("click", showLevelPicker);

    showLevelPicker();
  } catch (error) {
    console.error(error);
    elements.startScreen?.classList.add("hidden");
    elements.quizScreen?.classList.add("hidden");
    elements.finishScreen?.classList.remove("hidden");
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
