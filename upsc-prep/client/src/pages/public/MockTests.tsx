import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, FileQuestion } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { testService } from "@/services/testService";
import { Test } from "@/types";
import { useAuth } from "@/hooks/useAuth";

const testTypes = ["FULL_LENGTH", "SUBJECT", "TOPIC", "PYQ", "CUSTOM"];

export function MockTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [testType, setTestType] = useState("");
  const { isAuthenticated } = useAuth();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await testService.list({ search: search || undefined, testType: testType || undefined });
      setTests(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testType]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-serif text-3xl font-semibold text-ink dark:text-paper">Mock Tests</h1>
      <p className="mt-1 text-ink/60 dark:text-paper/60">Full-length mocks, subject tests, topic tests and more.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={16} />
          <Input
            placeholder="Search tests by title..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <Select value={testType} onChange={(e) => setTestType(e.target.value)} className="sm:w-56">
          <option value="">All test types</option>
          {testTypes.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-8">
        {loading ? (
          <FullPageSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : tests.length === 0 ? (
          <EmptyState
            icon={<FileQuestion size={32} />}
            title="No tests found"
            description="Try a different search or run the seed script to populate demo tests."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <Card key={test._id} className="flex flex-col p-5">
                <span className="text-xs font-medium uppercase tracking-wide text-maroon">
                  {test.testType.replace("_", " ")}
                </span>
                <h3 className="mt-2 font-serif text-lg font-semibold text-ink dark:text-paper">{test.title}</h3>
                {test.description && (
                  <p className="mt-1 text-sm text-ink/60 dark:text-paper/60 line-clamp-2">{test.description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink/60 dark:text-paper/60">
                  <span className="flex items-center gap-1">
                    <FileQuestion size={14} /> {test.totalQuestions ?? test.questions?.length ?? 0} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {test.settings.durationMinutes} min
                  </span>
                </div>
                <div className="mt-2 text-xs text-ink/50 dark:text-paper/50">
                  {test.difficulty} · Attempted {test.attemptCount} time{test.attemptCount === 1 ? "" : "s"}
                </div>
                <Link
                  to={isAuthenticated ? `/test/${test._id}` : "/login"}
                  className="mt-5"
                >
                  <Button className="w-full">Start test</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
