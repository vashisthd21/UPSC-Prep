import { Schema, model, Document, Types } from "mongoose";

export type AnswerStatus =
  | "UNVISITED"
  | "VISITED"
  | "ANSWERED"
  | "MARKED_FOR_REVIEW"
  | "ANSWERED_REVIEW";

export interface IAnswerRecord {
  question: Types.ObjectId;
  selected?: "A" | "B" | "C" | "D";
  status: AnswerStatus;
  timeSpentSeconds: number;
  isCorrect?: boolean;
}

export interface ITestAttempt extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  test: Types.ObjectId;
  answers: IAnswerRecord[];
  score: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracy: number;
  timeTakenSeconds: number;
  status: "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED";
  startedAt: Date;
  submittedAt?: Date;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const answerRecordSchema = new Schema<IAnswerRecord>(
  {
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    selected: { type: String, enum: ["A", "B", "C", "D"] },
    status: {
      type: String,
      enum: ["UNVISITED", "VISITED", "ANSWERED", "MARKED_FOR_REVIEW", "ANSWERED_REVIEW"],
      default: "UNVISITED",
    },
    timeSpentSeconds: { type: Number, default: 0 },
    isCorrect: { type: Boolean },
  },
  { _id: false }
);

const testAttemptSchema = new Schema<ITestAttempt>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    test: { type: Schema.Types.ObjectId, ref: "Test", required: true },
    answers: { type: [answerRecordSchema], default: [] },
    score: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    unattemptedCount: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "SUBMITTED", "AUTO_SUBMITTED"],
      default: "IN_PROGRESS",
    },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date },
    durationMinutes: { type: Number, required: true },
  },
  { timestamps: true }
);

testAttemptSchema.index({ user: 1, createdAt: -1 });

export const TestAttempt = model<ITestAttempt>("TestAttempt", testAttemptSchema);
