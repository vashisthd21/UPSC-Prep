import { Schema, model, Document, Types } from "mongoose";

export interface IBookmark extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  question: Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

bookmarkSchema.index({ user: 1, question: 1 }, { unique: true });

export const Bookmark = model<IBookmark>("Bookmark", bookmarkSchema);
