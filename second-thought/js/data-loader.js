/**
 * data-loader.js
 * Fetches JSON content files and joins challenges with bias metadata.
 */

const LETTERS = ["A", "B", "C", "D"];

export async function loadQuizData() {
  const [biases, challenges, categories] = await Promise.all([
    fetch("data/biases.json").then((response) => {
      if (!response.ok) throw new Error("Could not load biases.json");
      return response.json();
    }),
    fetch("data/challenges.json").then((response) => {
      if (!response.ok) throw new Error("Could not load challenges.json");
      return response.json();
    }),
    fetch("data/categories.json").then((response) => {
      if (!response.ok) throw new Error("Could not load categories.json");
      return response.json();
    }),
  ]);

  const biasById = Object.fromEntries(biases.map((bias) => [bias.biasId, bias]));

  const enrichedChallenges = challenges.map((challenge) => {
    const bias = biasById[challenge.biasId];
    const letter = challenge.correctAnswer;
    const correctOptionText = challenge.options[letter];

    if (!bias) {
      console.warn(`Missing bias for challenge ${challenge.challengeId}`);
    }
    if (!correctOptionText) {
      console.warn(`Invalid correct answer for challenge ${challenge.challengeId}`);
    }

    return {
      ...challenge,
      biasCategory: bias?.category ?? "Uncategorized",
      correctOptionText,
      optionList: LETTERS.map((key) => ({
        letter: key,
        text: challenge.options[key],
      })),
    };
  });

  return {
    biases,
    categories,
    challenges: enrichedChallenges,
  };
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function getCorrectFeedbackHtml(biasName) {
  return `Nice spot — this is <strong>${escapeHtml(biasName)}</strong>.`;
}

export function getIncorrectFeedbackHtml(biasName) {
  return `Not quite — the pattern here is <strong>${escapeHtml(biasName)}</strong>.`;
}
