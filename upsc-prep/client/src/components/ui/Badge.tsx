import { HTMLAttributes } from "react";
import clsx from "clsx";

type Tone = "neutral" | "success" | "danger" | "gold" | "maroon";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-ink/5 text-ink dark:bg-paper/10 dark:text-paper",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  gold: "bg-gold/10 text-gold",
  maroon: "bg-maroon/10 text-maroon",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
