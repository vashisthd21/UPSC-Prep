import { Schema, model, Document, Types } from "mongoose";

export type TestType =
  | "FULL_LENGTH"
  | "SUBJECT"
  | "TOPIC"
  | "PYQ"
  | "CUSTOM";

export interface ITestSettings {
  marksPerCorrect: number;
  negativeMarks: number;
  durationMinutes: number;
}

export interface ITest extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  testType: TestType;
  subjects: string[];
  topics: string[];
  questions: Types.ObjectId[];
  difficulty: "Easy" | "Medium" | "Hard" | "Very Hard" | "Mixed";
  settings: ITestSettings;
  isPublished: boolean;
  createdBy: Types.ObjectId;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const testSettingsSchema = new Schema<ITestSettings>(
  {
    marksPerCorrect: { type: Number, default: 2 },
    negativeMarks: { type: Number, default: 0.6667 },
    durationMinutes: { type: Number, required: true },
  },
  { _id: false }
);

const testSchema = new Schema<ITest>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    testType: {
      type: String,
      enum: ["FULL_LENGTH", "SUBJECT", "TOPIC", "PYQ", "CUSTOM"],
      required: true,
    },
    subjects: { type: [String], default: [] },
    topics: { type: [String], default: [] },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question", required: true }],
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Very Hard", "Mixed"],
      default: "Mixed",
    },
    settings: { type: testSettingsSchema, required: true },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attemptCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

testSchema.virtual("totalQuestions").get(function (this: ITest) {
  return this.questions.length;
});

testSchema.set("toJSON", { virtuals: true });

export const Test = model<ITest>("Test", testSchema);
