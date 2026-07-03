/**
 * ui.js
 * Renders the quiz screen and handles scroll + button states.
 */

import { getCorrectFeedback, getIncorrectFeedback } from "./data-loader.js";

function padNumber(value) {
  return String(value).padStart(2, "0");
}

export class QuizUI {
  constructor(elements) {
    this.el = elements;
  }

  showQuizScreen() {
    this.el.quizScreen.classList.remove("hidden");
    this.el.finishScreen.classList.add("hidden");
    this.el.btnNext.hidden = false;
  }

  renderQuestion(challenge, progress) {
    this.showQuizScreen();

    this.el.scenario.textContent = challenge.statement;
    this.el.footerCategory.textContent = challenge.biasCategory;

    this.el.questionProgress.textContent = `${progress.current}/${progress.total}`;

    this.el.feedback.classList.add("hidden");
    this.el.feedbackVerdict.textContent = "";
    this.el.feedbackExplanation.textContent = "";
    this.el.feedbackWhyHumans.textContent = "";
    this.el.feedbackReflection.textContent = "";

    this.el.answers.innerHTML = "";
    challenge.optionList.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer";
      button.dataset.letter = option.letter;
      button.setAttribute("role", "option");
      button.innerHTML = `
        <span class="answer-letter">${option.letter}</span>
        <span class="answer-text">${option.text}</span>
      `;
      this.el.answers.appendChild(button);
    });

    this.el.btnNext.disabled = true;
    this.el.btnNext.textContent = "Next →";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  bindAnswerHandler(handler) {
    this.el.answers.addEventListener("click", (event) => {
      const button = event.target.closest(".answer");
      if (!button || button.disabled) return;
      handler(button.dataset.letter);
    });
  }

  showFeedback(result) {
    const { isCorrect, selectedLetter, challenge } = result;
    const biasName = challenge.biasName;

    this.el.answers.querySelectorAll(".answer").forEach((button) => {
      button.disabled = true;
      button.classList.remove("selected");

      const letter = button.dataset.letter;
      if (letter === challenge.correctAnswer) {
        button.classList.add("correct");
      } else if (letter === selectedLetter && !isCorrect) {
        button.classList.add("incorrect");
      }
    });

    const selectedButton = this.el.answers.querySelector(
      `[data-letter="${selectedLetter}"]`
    );
    if (selectedButton) selectedButton.classList.add("selected");

    this.el.feedbackVerdict.textContent = isCorrect
      ? getCorrectFeedback(biasName)
      : getIncorrectFeedback(biasName);
    this.el.feedbackVerdict.className = `feedback-verdict ${
      isCorrect ? "is-correct" : "is-incorrect"
    }`;
    this.el.feedbackExplanation.textContent = challenge.explanation;
    this.el.feedbackWhyHumans.textContent = challenge.whyHumansDoThis;
    this.el.feedbackReflection.textContent = challenge.reflectionQuestion;
    this.el.feedback.classList.remove("hidden");

    this.el.btnNext.disabled = false;

    requestAnimationFrame(() => {
      this.el.feedback.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  showFinishScreen() {
    this.el.quizScreen.classList.add("hidden");
    this.el.finishScreen.classList.remove("hidden");
    this.el.footerCategory.textContent = "";
    this.el.btnNext.hidden = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
