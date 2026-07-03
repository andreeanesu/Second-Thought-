/**
 * ui.js
 * Renders the quiz screen and handles scroll + button states.
 */

import { getCorrectFeedback, getIncorrectFeedback } from "./data-loader.js";

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
    this.el.feedbackWhyHumans.textContent = "";
    this.el.feedbackReflection.textContent = "";

    this.el.answers.innerHTML = "";
    challenge.optionList.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer";
      button.dataset.letter = option.letter;
      button.setAttribute("role", "option");
      button.setAttribute("aria-label", `${option.letter}, ${option.text}`);
      button.innerHTML = `
        <span class="answer-letter">${option.letter}</span>
        <span class="answer-text">
          <span class="answer-label">${option.text}</span>
        </span>
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
      button.classList.remove("selected", "correct", "incorrect");
      button.querySelector(".answer-icon")?.remove();

      const letter = button.dataset.letter;
      const label = button.querySelector(".answer-label")?.textContent ?? "";

      if (letter === challenge.correctAnswer) {
        this.markAnswer(button, "correct", label);
      } else if (letter === selectedLetter && !isCorrect) {
        this.markAnswer(button, "incorrect", label);
      } else {
        button.setAttribute("aria-label", `${letter}, ${label}`);
      }
    });

    this.el.feedbackVerdict.textContent = isCorrect
      ? getCorrectFeedback(biasName)
      : getIncorrectFeedback(biasName);
    this.el.feedbackVerdict.className = `feedback-verdict ${
      isCorrect ? "is-correct" : "is-incorrect"
    }`;
    this.el.feedbackWhyHumans.textContent = challenge.whyHumansDoThis;
    this.el.feedbackReflection.textContent = challenge.reflectionQuestion;
    this.el.feedback.classList.remove("hidden");

    this.el.btnNext.disabled = false;

    requestAnimationFrame(() => {
      this.el.feedback.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  markAnswer(button, state, label) {
    const letter = button.dataset.letter;
    button.classList.add(state);
    button.setAttribute(
      "aria-label",
      `${letter}, ${label}, ${state === "correct" ? "correct answer" : "incorrect"}`
    );

    const icon = document.createElement("span");
    icon.className = "answer-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = state === "correct" ? "✓" : "✗";
    button.querySelector(".answer-text")?.appendChild(icon);
  }

  showFinishScreen(sessionMeta) {
    this.el.quizScreen.classList.add("hidden");
    this.el.finishScreen.classList.remove("hidden");
    this.el.footerCategory.textContent = "";
    this.el.btnNext.hidden = true;

    if (sessionMeta && this.el.finishTitle && this.el.finishMessage) {
      const { seenCount, totalCount, remainingInPool, sessionSize } = sessionMeta;

      this.el.finishTitle.textContent = "You've finished this round";

      if (remainingInPool === 0) {
        this.el.finishMessage.textContent =
          `You've seen all ${totalCount} questions. Next round starts a fresh cycle — shuffled from the beginning.`;
      } else if (remainingInPool < 5) {
        this.el.finishMessage.textContent =
          `You've seen ${seenCount} of ${totalCount}. Next round has ${remainingInPool} new question${remainingInPool === 1 ? "" : "s"} before the cycle restarts.`;
      } else {
        this.el.finishMessage.textContent =
          `You've seen ${seenCount} of ${totalCount}. Next round brings up to 5 new questions you haven't had yet.`;
      }

      if (sessionSize < 5) {
        this.el.finishMessage.textContent += ` (This round had ${sessionSize} — you're near the end of the set.)`;
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
