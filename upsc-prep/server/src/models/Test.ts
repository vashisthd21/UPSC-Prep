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
    marksPerCorrect: {
      type: Number,
      default: 2,
    },

    negativeMarks: {
      type: Number,
      default: 0.6667,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  }
);

const testSchema = new Schema<ITest>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    testType: {
      type: String,
      enum: ["FULL_LENGTH", "SUBJECT", "TOPIC", "PYQ", "CUSTOM"],
      required: true,
    },

    subjects: {
      type: [String],
      default: [],
    },

    topics: {
      type: [String],
      default: [],
    },

    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Very Hard", "Mixed"],
      default: "Mixed",
    },

    settings: {
      type: testSettingsSchema,
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attemptCount: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

/**
 * IMPORTANT:
 *
 * listTests() uses .select("-questions")
 * Therefore this.questions can be undefined.
 *
 * Never directly use:
 *   this.questions.length
 *
 * because it can cause:
 *   Cannot read properties of undefined
 */
testSchema.virtual("totalQuestions").get(function (this: ITest) {
  return Array.isArray(this.questions) ? this.questions.length : 0;
});

testSchema.set("toJSON", {
  virtuals: true,
});

testSchema.set("toObject", {
  virtuals: true,
});

export const Test = model<ITest>("Test", testSchema);
