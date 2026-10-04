import { Schema, model, Document, Types } from "mongoose";

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

export interface IQuestionOption {
  key: "A" | "B" | "C" | "D";
  text: string;
}

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  questionText: string;
  options: IQuestionOption[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
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
  isActive: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const optionSchema = new Schema<IQuestionOption>(
  {
    key: { type: String, enum: ["A", "B", "C", "D"], required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const questionSchema = new Schema<IQuestion>(
  {
    questionText: { type: String, required: true },
    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator: (v: IQuestionOption[]) => v.length === 4,
        message: "A question must have exactly 4 options",
      },
    },
    correctAnswer: { type: String, enum: ["A", "B", "C", "D"], required: true },
    explanation: { type: String, required: true },
    upscTakeaway: { type: String },
    subject: { type: String, required: true, index: true },
    topic: { type: String, required: true, index: true },
    subtopic: { type: String },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Very Hard"],
      required: true,
    },
    questionType: {
      type: String,
      enum: [
        "MCQ",
        "STATEMENT",
        "ASSERTION_REASON",
        "MATCH_FOLLOWING",
        "CHRONOLOGY",
        "COUNT_STATEMENTS",
        "CONCEPT_APPLICATION",
        "PYQ",
      ],
      required: true,
    },
    year: { type: Number },
    isPYQ: { type: Boolean, default: false, index: true },
    source: { type: String },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

questionSchema.index({ questionText: "text", tags: "text" });

// A PYQ must carry the year it appeared in; a generated practice question
// must never silently look like one. Enforced at the schema level so a bad
// import can't mislabel content.
questionSchema.pre("validate", function (next) {
  if (this.isPYQ && !this.year) {
    return next(new Error("isPYQ questions must specify a year"));
  }
  next();
});

export const Question = model<IQuestion>("Question", questionSchema);
