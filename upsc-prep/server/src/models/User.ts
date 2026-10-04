import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "student" | "admin";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  targetYear?: number;
  optionalSubject?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    targetYear: { type: Number },
    optionalSubject: { type: String, trim: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>("User", userSchema);
