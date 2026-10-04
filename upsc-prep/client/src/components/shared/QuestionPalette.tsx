import clsx from "clsx";
import { AnswerStatus } from "@/types";

const statusClasses: Record<AnswerStatus, string> = {
  UNVISITED: "bg-ink/5 text-ink/60 dark:bg-paper/10 dark:text-paper/60",
  VISITED: "bg-danger/15 text-danger",
  ANSWERED: "bg-success/90 text-white",
  MARKED_FOR_REVIEW: "bg-gold text-white",
  ANSWERED_REVIEW: "bg-gold text-white ring-2 ring-success ring-offset-1",
};

export const paletteLegend: { status: AnswerStatus; label: string }[] = [
  { status: "UNVISITED", label: "Not visited" },
  { status: "VISITED", label: "Visited, unanswered" },
  { status: "ANSWERED", label: "Answered" },
  { status: "MARKED_FOR_REVIEW", label: "Marked for review" },
  { status: "ANSWERED_REVIEW", label: "Answered + marked for review" },
];

export function QuestionPalette({
  total,
  statuses,
  currentIndex,
  onJump,
}: {
  total: number;
  statuses: AnswerStatus[];
  currentIndex: number;
  onJump: (index: number) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            className={clsx(
              "flex h-9 w-9 items-center justify-center rounded text-xs font-semibold transition-transform",
              statusClasses[statuses[i] || "UNVISITED"],
              currentIndex === i && "ring-2 ring-ink dark:ring-paper scale-105"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-1.5 text-xs text-ink/60 dark:text-paper/60">
        {paletteLegend.map((l) => (
          <div key={l.status} className="flex items-center gap-2">
            <span className={clsx("h-3 w-3 rounded-sm", statusClasses[l.status])} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
