import { IAnswerRecord } from "../models/TestAttempt";
import { ITestSettings } from "../models/Test";

export interface ScoreResult {
  score: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracy: number;
}

// Configurable UPSC-style marking: correct = +marksPerCorrect,
// incorrect = -negativeMarks, unattempted = 0. Nothing here is hard-coded
// to the default +2/-0.6667 scheme - it reads whatever the test defines.
export function computeScore(
  answers: IAnswerRecord[],
  settings: ITestSettings
): ScoreResult {
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  for (const answer of answers) {
    if (!answer.selected) {
      unattemptedCount += 1;
      continue;
    }
    if (answer.isCorrect) {
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }
  }

  const score =
    correctCount * settings.marksPerCorrect - incorrectCount * settings.negativeMarks;

  const attempted = correctCount + incorrectCount;
  const accuracy = attempted > 0 ? (correctCount / attempted) * 100 : 0;

  return {
    score: Math.round(score * 100) / 100,
    correctCount,
    incorrectCount,
    unattemptedCount,
    accuracy: Math.round(accuracy * 100) / 100,
  };
}
