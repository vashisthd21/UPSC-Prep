import { useEffect, useState } from "react";
import { CalendarDays, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { questionService } from "@/services/questionService";
import { Question } from "@/types";

export function PYQs() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [facets, setFacets] = useState<{ subjects: string[]; years: number[] }>({ subjects: [], years: [] });
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    questionService.facets().then(setFacets).catch(() => undefined);
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await questionService.list({
        isPYQ: true,
        year: year ? Number(year) : undefined,
        subject: subject || undefined,
        limit: 30,
      });
      setQuestions(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PYQs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, subject]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-serif text-3xl font-semibold text-ink dark:text-paper">Previous Year Questions</h1>
      <p className="mt-1 text-ink/60 dark:text-paper/60">
        Actual UPSC Prelims questions, always clearly marked as PYQ with their year.
      </p>

      <div className="mt-4 flex items-start gap-2 rounded-md border border-gold/30 bg-gold/5 px-3 py-2.5 text-xs text-ink/70 dark:text-paper/70">
        <Info size={14} className="mt-0.5 shrink-0 text-gold" />
        This seed installation ships only original practice questions, none labelled as PYQ.
        Add verified previous-year questions with their official year through the admin panel to populate this section.
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">All years</option>
          {facets.years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </Select>
        <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">All subjects</option>
          {facets.subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      <div className="mt-8 space-y-4">
        {loading ? (
          <FullPageSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : questions.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={32} />}
            title="No previous year questions yet"
            description="None have been added to this installation's question bank yet."
          />
        ) : (
          questions.map((q) => (
            <Card key={q._id} className="p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone="maroon">PYQ {q.year}</Badge>
                <Badge>{q.subject}</Badge>
                <Badge>{q.topic}</Badge>
              </div>
              <p className="whitespace-pre-line text-sm text-ink dark:text-paper">{q.questionText}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
