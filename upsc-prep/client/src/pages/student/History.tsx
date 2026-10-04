import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { attemptService } from "@/services/attemptService";
import { Test, TestAttempt } from "@/types";

export function History() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(p: number) {
    setLoading(true);
    setError(null);
    try {
      const data = await attemptService.history(p, 10);
      setAttempts(data.items);
      setPages(data.pagination.pages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="px-5 py-8 md:px-8">
      <h1 className="font-serif text-2xl font-semibold text-ink dark:text-paper">Test History</h1>
      <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">Every test you've submitted.</p>

      <div className="mt-6">
        {loading ? (
          <FullPageSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(page)} />
        ) : attempts.length === 0 ? (
          <EmptyState icon={<HistoryIcon size={32} />} title="No tests completed yet" />
        ) : (
          <Card className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-ink/10 dark:border-paper/10 text-left text-ink/50 dark:text-paper/50">
                  <th className="px-5 py-3 font-medium">Test</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Accuracy</th>
                  <th className="px-5 py-3 font-medium">Correct</th>
                  <th className="px-5 py-3 font-medium">Incorrect</th>
                  <th className="px-5 py-3 font-medium">Unattempted</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Review</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a._id} className="border-b border-ink/5 dark:border-paper/5 last:border-0">
                    <td className="px-5 py-3 text-ink dark:text-paper">{(a.test as Test)?.title || "Test"}</td>
                    <td className="px-5 py-3 text-ink/70 dark:text-paper/70">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-ink/70 dark:text-paper/70">{a.score}</td>
                    <td className="px-5 py-3 text-ink/70 dark:text-paper/70">{a.accuracy}%</td>
                    <td className="px-5 py-3 text-success">{a.correctCount}</td>
                    <td className="px-5 py-3 text-danger">{a.incorrectCount}</td>
                    <td className="px-5 py-3 text-ink/50 dark:text-paper/50">{a.unattemptedCount}</td>
                    <td className="px-5 py-3 text-ink/70 dark:text-paper/70">{Math.round(a.timeTakenSeconds / 60)}m</td>
                    <td className="px-5 py-3">
                      <Link to={`/review/${a._id}`}><Button size="sm" variant="outline">Review</Button></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {pages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="flex items-center px-2 text-sm text-ink/60 dark:text-paper/60">{page} / {pages}</span>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
