import { Schema, model, Document, Types } from "mongoose";

export type ReportReason =
  | "INCORRECT_ANSWER"
  | "AMBIGUOUS_QUESTION"
  | "INCORRECT_EXPLANATION"
  | "TYPO"
  | "OTHER";

export interface IReport extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  question: Types.ObjectId;
  reason: ReportReason;
  comment?: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  createdAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    reason: {
      type: String,
      enum: ["INCORRECT_ANSWER", "AMBIGUOUS_QUESTION", "INCORRECT_EXPLANATION", "TYPO", "OTHER"],
      required: true,
    },
    comment: { type: String },
    status: { type: String, enum: ["OPEN", "RESOLVED", "DISMISSED"], default: "OPEN" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Report = model<IReport>("Report", reportSchema);
