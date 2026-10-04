export type UserRole = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  targetYear?: number;
  optionalSubject?: string;
}

export type Difficulty = "Easy" | "Medium" | "Hard" | "Very Hard";

export type QuestionType =
  | "MCQ"
  | "STATEMENT"
  | "ASSERTION_REASON"
  | "MATCH_FOLLOWING"
  | "CHRONOLOGY"
  | "COUNT_STATEMENTS"
  | "CONCEPT_APPLICATION"
  | "PYQ";

export interface QuestionOption {
  key: "A" | "B" | "C" | "D";
  text: string;
}

export interface Question {
  _id: string;
  questionText: string;
  options: QuestionOption[];
  correctAnswer?: "A" | "B" | "C" | "D";
  explanation?: string;
  upscTakeaway?: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  year?: number;
  isPYQ: boolean;
  source?: string;
  tags: string[];
  createdAt: string;
}

export type TestType = "FULL_LENGTH" | "SUBJECT" | "TOPIC" | "PYQ" | "CUSTOM";

export interface TestSettings {
  marksPerCorrect: number;
  negativeMarks: number;
  durationMinutes: number;
}

export interface Test {
  _id: string;
  title: string;
  description?: string;
  testType: TestType;
  subjects: string[];
  topics: string[];
  questions: string[];
  totalQuestions?: number;
  difficulty: Difficulty | "Mixed";
  settings: TestSettings;
  attemptCount: number;
  isPublished?: boolean;
  createdAt: string;
}

export type AnswerStatus =
  | "UNVISITED"
  | "VISITED"
  | "ANSWERED"
  | "MARKED_FOR_REVIEW"
  | "ANSWERED_REVIEW";

export interface AnswerRecord {
  question: string;
  selected?: "A" | "B" | "C" | "D";
  status: AnswerStatus;
  timeSpentSeconds: number;
  isCorrect?: boolean;
}

export interface TestAttempt {
  _id: string;
  user: string;
  test: string | Test;
  answers: AnswerRecord[];
  score: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracy: number;
  timeTakenSeconds: number;
  status: "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED";
  startedAt: string;
  submittedAt?: string;
  durationMinutes: number;
  createdAt: string;
}

export interface ReviewItem {
  question: Question;
  selected?: "A" | "B" | "C" | "D";
  isCorrect?: boolean;
  status: AnswerStatus;
}

export interface Bookmark {
  _id: string;
  user: string;
  question: Question;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  details?: unknown;
}

export interface OverviewAnalytics {
  testsAttempted: number;
  questionsSolved: number;
  avgScore: number;
  avgAccuracy: number;
  currentStreak: number;
  scoreTrend: { testNumber: number; score: number; accuracy: number; date: string }[];
}

export interface SubjectAnalytic {
  subject: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface TopicAnalytic {
  subject: string;
  topic: string;
  attempted: number;
  correct: number;
  accuracy: number;
}
