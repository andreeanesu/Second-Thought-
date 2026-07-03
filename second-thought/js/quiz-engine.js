/**
 * quiz-engine.js
 * Session logic: shuffle, 5 questions per round, no repeats until all seen.
 */

const SESSION_SIZE = 5;
const STORAGE_KEY = "second-thought-seen-challenges";

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadSeenIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

function saveSeenIds(seenIds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seenIds]));
}

export class QuizEngine {
  constructor(allChallenges) {
    this.allChallenges = allChallenges;
    this.sessionChallenges = [];
    this.currentIndex = 0;
    this.hasAnswered = false;
    this.selectedLetter = null;
    this.sessionMeta = null;
    this.correctCount = 0;
  }

  startSession() {
    let seenIds = loadSeenIds();
    let available = this.allChallenges.filter(
      (challenge) => !seenIds.has(challenge.challengeId)
    );
    let poolReset = false;

    if (available.length === 0) {
      seenIds = new Set();
      available = [...this.allChallenges];
      poolReset = true;
    }

    const shuffled = shuffleArray(available);
    const sessionCount = Math.min(SESSION_SIZE, available.length);
    this.sessionChallenges = shuffled.slice(0, sessionCount);

    this.sessionChallenges.forEach((challenge) => {
      seenIds.add(challenge.challengeId);
    });
    saveSeenIds(seenIds);

    const total = this.allChallenges.length;
    const seenCount = seenIds.size;
    const remainingInPool = total - seenCount;

    this.sessionMeta = {
      poolReset,
      seenCount,
      totalCount: total,
      remainingInPool,
      sessionSize: sessionCount,
    };

    this.currentIndex = 0;
    this.hasAnswered = false;
    this.selectedLetter = null;
    this.correctCount = 0;
  }

  getRoundScore() {
    return {
      correct: this.correctCount,
      total: this.sessionChallenges.length,
    };
  }

  getSessionMeta() {
    return this.sessionMeta;
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
    if (isCorrect) this.correctCount += 1;

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
