import { InputHTMLAttributes, forwardRef, LabelHTMLAttributes } from "react";
import clsx from "clsx";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/40",
        "focus:border-maroon focus:outline-none focus:ring-1 focus:ring-maroon",
        "dark:bg-ink-soft/30 dark:border-paper/15 dark:text-paper dark:placeholder:text-paper/40",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="mb-1.5 block text-sm font-medium text-ink/80 dark:text-paper/80" {...props} />;
}

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={clsx(
      "w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink",
      "focus:border-maroon focus:outline-none focus:ring-1 focus:ring-maroon",
      "dark:bg-ink-soft/30 dark:border-paper/15 dark:text-paper",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/40",
        "focus:border-maroon focus:outline-none focus:ring-1 focus:ring-maroon",
        "dark:bg-ink-soft/30 dark:border-paper/15 dark:text-paper",
        className
      )}
      {...props}
    />
  );
}
