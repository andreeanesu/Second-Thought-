/**
 * quiz-engine.js
 * Session logic: shuffle, 5 questions per round, answer checking.
 */

const SESSION_SIZE = 5;

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export class QuizEngine {
  constructor(allChallenges) {
    this.allChallenges = allChallenges;
    this.sessionChallenges = [];
    this.currentIndex = 0;
    this.hasAnswered = false;
    this.selectedLetter = null;
  }

  startSession() {
    const shuffled = shuffleArray(this.allChallenges);
    this.sessionChallenges = shuffled.slice(0, SESSION_SIZE);
    this.currentIndex = 0;
    this.hasAnswered = false;
    this.selectedLetter = null;
  }

  get sessionSize() {
    return this.sessionChallenges.length;
  }

  getCurrentChallenge() {
    return this.sessionChallenges[this.currentIndex] ?? null;
  }

  selectAnswer(letter) {
    if (this.hasAnswered) return null;

    const challenge = this.getCurrentChallenge();
    if (!challenge) return null;

    this.hasAnswered = true;
    this.selectedLetter = letter;

    const isCorrect = letter === challenge.correctAnswer;

    return {
      isCorrect,
      selectedLetter: letter,
      selectedText: challenge.options[letter],
      correctLetter: challenge.correctAnswer,
      correctText: challenge.correctOptionText,
      challenge,
    };
  }

  canGoNext() {
    return this.hasAnswered;
  }

  goNext() {
    if (!this.hasAnswered) return false;

    this.currentIndex += 1;
    this.hasAnswered = false;
    this.selectedLetter = null;

    return true;
  }

  isFinished() {
    return this.currentIndex >= this.sessionChallenges.length;
  }

  getProgress() {
    const total = this.sessionChallenges.length;
    const current = Math.min(this.currentIndex + 1, total);
    const percent = total <= 1 ? 100 : (this.currentIndex / (total - 1)) * 100;

    return { current, total, percent };
  }
}

export { SESSION_SIZE };
