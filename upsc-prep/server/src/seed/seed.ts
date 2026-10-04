import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db";
import { User } from "../models/User";
import { Question } from "../models/Question";
import { Test } from "../models/Test";
import questionsData from "./questions.json";

interface RawQuestion {
  questionText: string;
  options: string[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  upscTakeaway?: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: string;
  questionType: string;
  isPYQ: boolean;
  source?: string;
  tags?: string[];
}

async function seed() {
  await connectDB();

  console.log("[seed] clearing existing questions and demo tests...");
  await Question.deleteMany({});
  await Test.deleteMany({});

  let admin = await User.findOne({ email: "admin@upscprep.local" });
  if (!admin) {
    admin = await User.create({
      name: "Platform Admin",
      email: "admin@upscprep.local",
      password: "ChangeMe123!",
      role: "admin",
    });
    console.log("[seed] created admin user admin@upscprep.local / ChangeMe123!");
  }

  let student = await User.findOne({ email: "student@upscprep.local" });
  if (!student) {
    student = await User.create({
      name: "Demo Student",
      email: "student@upscprep.local",
      password: "ChangeMe123!",
      role: "student",
      targetYear: new Date().getFullYear() + 1,
    });
    console.log("[seed] created demo student student@upscprep.local / ChangeMe123!");
  }

  const rows = questionsData as RawQuestion[];
  const docs = rows.map((row) => ({
    questionText: row.questionText,
    options: row.options.map((text, i) => ({ key: "ABCD"[i], text })),
    correctAnswer: row.correctAnswer,
    explanation: row.explanation,
    upscTakeaway: row.upscTakeaway,
    subject: row.subject,
    topic: row.topic,
    subtopic: row.subtopic,
    difficulty: row.difficulty,
    questionType: row.questionType,
    isPYQ: row.isPYQ,
    source: row.source,
    tags: row.tags || [],
    createdBy: admin._id,
  }));

  const inserted = await Question.insertMany(docs);
  console.log(`[seed] inserted ${inserted.length} Modern History questions`);

  const fullLength = await Test.create({
    title: "Modern History — Full Practice Test",
    description: "A comprehensive test covering the full Modern History question bank.",
    testType: "FULL_LENGTH",
    subjects: ["Modern History"],
    topics: [],
    questions: inserted.map((q) => q._id),
    difficulty: "Mixed",
    settings: { marksPerCorrect: 2, negativeMarks: 0.6667, durationMinutes: 45 },
    createdBy: admin._id,
  });

  const gandhianEra = inserted.filter((q) => q.topic === "Gandhian Era");
  const topicTest = await Test.create({
    title: "Topic Test — Gandhian Era",
    description: "Focused practice on the Gandhian phase of the freedom struggle.",
    testType: "TOPIC",
    subjects: ["Modern History"],
    topics: ["Gandhian Era"],
    questions: gandhianEra.map((q) => q._id),
    difficulty: "Mixed",
    settings: { marksPerCorrect: 2, negativeMarks: 0.6667, durationMinutes: 15 },
    createdBy: admin._id,
  });

  const constitutional = inserted.filter((q) => q.topic === "Constitutional Developments");
  const subjectTest = await Test.create({
    title: "Subject Test — Constitutional Developments",
    description: "All questions on constitutional Acts and reforms under British rule.",
    testType: "SUBJECT",
    subjects: ["Modern History"],
    topics: ["Constitutional Developments"],
    questions: constitutional.map((q) => q._id),
    difficulty: "Mixed",
    settings: { marksPerCorrect: 2, negativeMarks: 0.6667, durationMinutes: 20 },
    createdBy: admin._id,
  });

  console.log(
    `[seed] created tests: "${fullLength.title}", "${topicTest.title}", "${subjectTest.title}"`
  );
  console.log("[seed] done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
