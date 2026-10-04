import { FilterQuery } from "mongoose";
import { IQuestion, Question } from "../models/Question";

export interface CustomTestCriteria {
  subjects?: string[];
  topics?: string[];
  difficulty?: string[];
  questionTypes?: string[];
  numberOfQuestions: number;
  onlyPYQ?: boolean;
}

// Selects a de-duplicated random sample of questions matching the given
// criteria. Uses Mongo's $sample so the same question can never appear
// twice in one generated test.
export async function generateCustomTestQuestions(
  criteria: CustomTestCriteria
): Promise<IQuestion[]> {
  const match: FilterQuery<IQuestion> = { isActive: true };

  if (criteria.subjects?.length) match.subject = { $in: criteria.subjects };
  if (criteria.topics?.length) match.topic = { $in: criteria.topics };
  if (criteria.difficulty?.length) match.difficulty = { $in: criteria.difficulty };
  if (criteria.questionTypes?.length) match.questionType = { $in: criteria.questionTypes };
  if (criteria.onlyPYQ) match.isPYQ = true;

  const questions = await Question.aggregate([
    { $match: match },
    { $sample: { size: criteria.numberOfQuestions } },
  ]);

  return questions as IQuestion[];
}
