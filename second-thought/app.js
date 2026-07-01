/**
 * Second Thought — quiz data and app logic.
 * Each question is one object in this array. Later you can load from Excel/JSON.
 */
const QUESTIONS = [
  {
    scenario:
      "I only read news that agrees with what I already believe.",
    correct: "Confirmation bias",
    options: [
      "The Dunning–Kruger effect",
      "Confirmation bias",
      "Availability heuristic",
      "Anchoring effect",
    ],
    category: "Decision-making",
    difficulty: "beginner",
    explanation:
      "Confirmation bias is when we notice, remember, and trust information that fits what we already think. It can feel efficient — like we're staying consistent — but it quietly narrows what we're willing to consider.",
    reflection:
      "When did you last seek out an opinion only after you'd already made up your mind?",
    feedbackCorrect:
      "Nice spot — that's confirmation bias. It's one of the most common patterns in how we take in information.",
    feedbackIncorrect:
      "Good try — this one fools a lot of people. The pattern here is confirmation bias: gravitating toward information that matches what we already believe.",
  },
  {
    scenario:
      "The first price I saw was $500, so anything under that feels like a bargain — even if $500 was inflated.",
    correct: "Anchoring effect",
    options: [
      "Sunk cost fallacy",
      "Anchoring effect",
      "Hindsight bias",
      "Bandwagon effect",
    ],
    category: "Decision-making",
    difficulty: "beginner",
    explanation:
      "The anchoring effect happens when the first number or piece of information we encounter sticks in our mind and pulls later judgments toward it — even when that starting point was arbitrary or misleading.",
    reflection:
      "Think of a recent purchase. Did the first price you saw shape what felt 'reasonable' afterward?",
    feedbackCorrect:
      "Well done — that's the anchoring effect. Our brains often treat the first reference point as more meaningful than it really is.",
    feedbackIncorrect:
      "Not quite, and that's okay. This is the anchoring effect — the first figure we see can quietly set the frame for everything that follows.",
  },
  {
    scenario:
      "After one scary plane story in the news, flying feels much riskier than driving — even though statistics say otherwise.",
    correct: "Availability heuristic",
    options: [
      "Confirmation bias",
      "Fundamental attribution error",
      "Availability heuristic",
      "Dunning–Kruger effect",
    ],
    category: "Memory & judgment",
    difficulty: "beginner",
    explanation:
      "The availability heuristic is when we judge how likely something is based on how easily examples come to mind. Vivid or recent stories feel more common than they are — not because we're careless, but because memorable events are easier to recall.",
    reflection:
      "What recent headline or story has been lingering in your mind more than the everyday facts around it?",
    feedbackCorrect:
      "Exactly — that's the availability heuristic. Easy-to-remember examples can outweigh quieter, more accurate information.",
    feedbackIncorrect:
      "Close thinking. This one is the availability heuristic — when vivid or recent examples feel more representative than they truly are.",
  },
];

const LETTERS = ["A", "B", "C", "D"];

let currentIndex = 0;
let selectedOption = null;
let hasAnswered = false;

const scenarioEl = document.getElementById("scenario");
const answersEl = document.getElementById("answers");
const feedbackEl = document.getElementById("feedback");
const feedbackVerdictEl = document.getElementById("feedback-verdict");
const feedbackExplanationEl = document.getElementById("feedback-explanation");
const feedbackReflectionEl = document.getElementById("feedback-reflection");
const progressFillEl = document.getElementById("progress-fill");
const progressLabelEl = document.getElementById("progress-label");
const footerCategoryEl = document.getElementById("footer-category");
const btnNextEl = document.getElementById("btn-next");
const mainEl = document.getElementById("main");

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function renderQuestion() {
  const question = QUESTIONS[currentIndex];
  selectedOption = null;
  hasAnswered = false;

  scenarioEl.textContent = question.scenario;
  footerCategoryEl.textContent = question.category;

  const progressPercent =
    QUESTIONS.length === 1
      ? 100
      : (currentIndex / (QUESTIONS.length - 1)) * 100;
  progressFillEl.style.width = `${progressPercent}%`;
  progressLabelEl.textContent = `${padNumber(currentIndex + 1)} of ${padNumber(
    QUESTIONS.length
  )}`;

  feedbackEl.classList.add("hidden");
  feedbackVerdictEl.textContent = "";
  feedbackExplanationEl.textContent = "";
  feedbackReflectionEl.textContent = "";

  answersEl.innerHTML = "";
  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer";
    button.dataset.option = option;
    button.setAttribute("role", "option");
    button.innerHTML = `
      <span class="answer-letter">${LETTERS[index]}</span>
      <span class="answer-text">${option}</span>
    `;
    button.addEventListener("click", () => selectAnswer(option, button));
    answersEl.appendChild(button);
  });

  btnNextEl.disabled = true;
  btnNextEl.textContent = "Next →";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectAnswer(option, clickedButton) {
  if (hasAnswered) return;

  const question = QUESTIONS[currentIndex];
  hasAnswered = true;
  selectedOption = option;

  const isCorrect = option === question.correct;

  answersEl.querySelectorAll(".answer").forEach((button) => {
    button.disabled = true;
    button.classList.remove("selected");

    const label = button.dataset.option;
    if (label === question.correct) {
      button.classList.add("correct");
    } else if (label === option && !isCorrect) {
      button.classList.add("incorrect");
    }
  });

  clickedButton.classList.add("selected");

  feedbackVerdictEl.textContent = isCorrect
    ? question.feedbackCorrect
    : question.feedbackIncorrect;
  feedbackVerdictEl.className = `feedback-verdict ${
    isCorrect ? "is-correct" : "is-incorrect"
  }`;
  feedbackExplanationEl.textContent = question.explanation;
  feedbackReflectionEl.textContent = question.reflection;
  feedbackEl.classList.remove("hidden");

  btnNextEl.disabled = false;

  requestAnimationFrame(() => {
    feedbackEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function showFinishScreen() {
  mainEl.innerHTML = `
    <img
      class="character"
      src="assets/character.svg"
      alt=""
      width="88"
      height="102"
    />
    <section class="finish-screen">
      <h2>You've reached the end of Series I</h2>
      <p>
        Thank you for pausing to notice how your mind works.
        More biases — and your own spreadsheet — can plug in here whenever you're ready.
      </p>
    </section>
  `;

  footerCategoryEl.textContent = "";
  btnNextEl.disabled = true;
  btnNextEl.textContent = "Done";
}

function goNext() {
  if (!hasAnswered) return;

  currentIndex += 1;

  if (currentIndex >= QUESTIONS.length) {
    showFinishScreen();
    return;
  }

  renderQuestion();
}

btnNextEl.addEventListener("click", goNext);

renderQuestion();
