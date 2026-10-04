import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, LineChart, ListChecks, ScrollText, Target, Timer } from "lucide-react";

const features = [
  {
    icon: ScrollText,
    title: "UPSC-style question bank",
    description:
      "Statement-based, assertion-reason, match-the-following, chronology and concept questions written to mirror actual Prelims patterns.",
  },
  {
    icon: BookOpenCheck,
    title: "Previous Year Questions",
    description: "A dedicated PYQ section, clearly separated from practice questions, filterable by year and subject.",
  },
  {
    icon: ListChecks,
    title: "Topic and subject tests",
    description: "Drill into a single topic, an entire GS paper, or generate a custom test from your own criteria.",
  },
  {
    icon: Timer,
    title: "Full-length mock exams",
    description: "A real exam interface — question palette, timer, mark-for-review — with UPSC's own marking scheme.",
  },
  {
    icon: LineChart,
    title: "Detailed analytics",
    description: "Score trends, subject and topic accuracy, and weak areas computed from your own attempt history.",
  },
  {
    icon: Target,
    title: "Progress tracking",
    description: "Streaks, accuracy trends and a full test history so you can see improvement over time.",
  },
];

const stats = [
  { value: "30+", label: "Modern History questions in the seed bank" },
  { value: "8", label: "UPSC question formats supported" },
  { value: "3", label: "Ready-made practice tests" },
  { value: "1", label: "Configurable marking scheme (+2 / −0.67)" },
];

export function Landing() {
  return (
    <div>
      <section className="border-b border-ink/10 dark:border-paper/10">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-medium text-maroon">General Studies Paper I · Prelims</p>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight text-ink dark:text-paper">
              UPSC Prelims Mock Practice
            </h1>
            <p className="mt-5 text-lg text-ink/70 dark:text-paper/70">
              Practice smarter. Analyze deeper. Improve consistently.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/practice"
                className="inline-flex items-center gap-2 rounded-md bg-maroon px-6 py-3 text-sm font-medium text-white hover:bg-maroon-dark"
              >
                Start Practicing <ArrowRight size={16} />
              </Link>
              <Link
                to="/mock-tests"
                className="inline-flex items-center gap-2 rounded-md border border-ink/20 px-6 py-3 text-sm font-medium text-ink hover:border-maroon hover:text-maroon dark:border-paper/20 dark:text-paper"
              >
                Explore Mock Tests
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 dark:border-paper/10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-12 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-3xl font-semibold text-maroon">{s.value}</p>
              <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-serif text-2xl font-semibold text-ink dark:text-paper">
          Everything you need for serious Prelims preparation
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <f.icon size={22} className="text-maroon" />
              <h3 className="mt-3 font-serif text-lg font-semibold text-ink dark:text-paper">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60 dark:text-paper/60">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink/10 dark:border-paper/10">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center">
          <h2 className="font-serif text-2xl font-semibold text-ink dark:text-paper">Ready to start?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/60 dark:text-paper/60">
            Create a free account and take your first mock test in under a minute.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-maroon px-6 py-3 text-sm font-medium text-white hover:bg-maroon-dark"
          >
            Create free account <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
