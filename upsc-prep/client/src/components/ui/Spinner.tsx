import clsx from "clsx";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-maroon">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
