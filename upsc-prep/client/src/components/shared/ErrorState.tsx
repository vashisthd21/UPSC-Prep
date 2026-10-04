import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-danger/20 bg-danger/5 px-6 py-10 text-center">
      <AlertTriangle className="mb-2 text-danger" size={28} />
      <p className="text-sm text-ink/80 dark:text-paper/80">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
