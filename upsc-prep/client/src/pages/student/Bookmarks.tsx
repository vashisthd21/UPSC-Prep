import { useEffect, useState } from "react";
import { Bookmark as BookmarkIcon, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { bookmarkService } from "@/services/bookmarkService";
import { Bookmark } from "@/types";
import { useToast } from "@/components/ui/Toast";

export function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setBookmarks(await bookmarkService.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(questionId: string) {
    try {
      await bookmarkService.remove(questionId);
      setBookmarks((prev) => prev.filter((b) => b.question._id !== questionId));
    } catch {
      showToast("Could not remove bookmark", "error");
    }
  }

  return (
    <div className="px-5 py-8 md:px-8">
      <h1 className="font-serif text-2xl font-semibold text-ink dark:text-paper">Bookmarked Questions</h1>
      <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">{bookmarks.length} saved questions</p>

      <div className="mt-6">
        {loading ? (
          <FullPageSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : bookmarks.length === 0 ? (
          <EmptyState icon={<BookmarkIcon size={32} />} title="No bookmarks yet" description="Bookmark questions during review to revisit them here." />
        ) : (
          <div className="space-y-4">
            {bookmarks.map((b) => (
              <Card key={b._id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{b.question.subject}</Badge>
                    <Badge>{b.question.topic}</Badge>
                    <Badge tone="gold">{b.question.difficulty}</Badge>
                  </div>
                  <button onClick={() => remove(b.question._id)} className="text-ink/40 hover:text-danger shrink-0" aria-label="Remove bookmark">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-ink dark:text-paper">{b.question.questionText}</p>
                <p className="mt-2 text-xs text-ink/40 dark:text-paper/40">
                  Bookmarked on {new Date(b.createdAt).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
