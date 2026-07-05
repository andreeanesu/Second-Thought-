/**
 * quiz-engine.js
 * Session logic per play mode (tier), with per-tier progress in localStorage.
 */

const SESSION_SIZE = 5;
const PROGRESS_KEY = "second-thought-tier-progress";
const LEGACY_PROGRESS_KEY = "second-thought-seen-challenges";

export const PLAY_MODES = ["1", "2", "3", "mix"];

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadAllProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    // fall through to migration / empty
  }

  const empty = { 1: [], 2: [], 3: [], mix: [] };
  try {
    const legacy = localStorage.getItem(LEGACY_PROGRESS_KEY);
    if (legacy) {
      const ids = JSON.parse(legacy);
      if (Array.isArray(ids)) {
        empty.mix = ids;
        saveAllProgress(empty);
        localStorage.removeItem(LEGACY_PROGRESS_KEY);
      }
    }
  } catch {
    // ignore legacy migration errors
  }

  return empty;
}

function saveAllProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function getSeenSet(progress, mode) {
  const ids = progress[mode];
  return new Set(Array.isArray(ids) ? ids : []);
}

function saveSeenSet(progress, mode, seenIds) {
  progress[mode] = [...seenIds];
  saveAllProgress(progress);
}

export class QuizEngine {
  constructor(allChallenges) {
    this.allChallenges = allChallenges;
    this.mode = null;
    this.sessionChallenges = [];
    this.currentIndex = 0;
    this.hasAnswered = false;
    this.selectedLetter = null;
    this.sessionMeta = null;
    this.correctCount = 0;
    this.progress = loadAllProgress();
  }

  getPoolForMode(mode) {
    if (mode === "mix") return this.allChallenges;
    return this.allChallenges.filter(
      (challenge) => String(challenge.tier) === String(mode)
    );
  }

  getProgressSummary(mode) {
    const pool = this.getPoolForMode(mode);
    const seen = getSeenSet(this.progress, mode);
    const seenInPool = pool.filter((c) => seen.has(c.challengeId)).length;
    const biasCount = new Set(pool.map((c) => c.biasId)).size;

    return {
      mode,
      seenCount: seenInPool,
      totalCount: pool.length,
      biasCount,
      remainingCount: pool.length - seenInPool,
    };
  }

  getAllProgressSummaries() {
    return PLAY_MODES.map((mode) => this.getProgressSummary(mode));
  }

  setMode(mode) {
    if (!PLAY_MODES.includes(mode)) {
      throw new Error(`Unknown play mode: ${mode}`);
    }
    this.mode = mode;
  }

  startSession() {
    if (!this.mode) throw new Error("Play mode not selected");

    const pool = this.getPoolForMode(this.mode);
    let seenIds = getSeenSet(this.progress, this.mode);
    let available = pool.filter((c) => !seenIds.has(c.challengeId));
    let poolReset = false;

    if (available.length === 0 && pool.length > 0) {
      seenIds = new Set();
      available = [...pool];
      poolReset = true;
    }

    const shuffled = shuffleArray(available);
    const sessionCount = Math.min(SESSION_SIZE, available.length);
    this.sessionChallenges = shuffled.slice(0, sessionCount);

    this.sessionChallenges.forEach((challenge) => {
      seenIds.add(challenge.challengeId);
    });
    saveSeenSet(this.progress, this.mode, seenIds);

    const seenInPool = pool.filter((c) => seenIds.has(c.challengeId)).length;

    this.sessionMeta = {
      mode: this.mode,
      poolReset,
      seenCount: seenInPool,
      totalCount: pool.length,
      remainingInPool: pool.length - seenInPool,
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
