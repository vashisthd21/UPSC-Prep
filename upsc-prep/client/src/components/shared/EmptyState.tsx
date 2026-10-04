import { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-ink/15 dark:border-paper/15 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-ink/30 dark:text-paper/30">{icon}</div>}
      <h3 className="font-serif text-lg font-semibold text-ink dark:text-paper">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink/60 dark:text-paper/60">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
