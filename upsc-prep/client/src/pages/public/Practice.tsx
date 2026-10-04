import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { questionService } from "@/services/questionService";
import { testService } from "@/services/testService";
import { Question } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

const difficulties = ["Easy", "Medium", "Hard", "Very Hard"];

export function Practice() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [facets, setFacets] = useState<{ subjects: string[]; topics: string[] }>({ subjects: [], topics: [] });
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    questionService.facets().then((f) => setFacets({ subjects: f.subjects, topics: f.topics })).catch(() => undefined);
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await questionService.list({
        subject: subject || undefined,
        topic: topic || undefined,
        difficulty: difficulty || undefined,
        limit: 20,
      });
      setQuestions(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, topic, difficulty]);

  async function startPracticeTest() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setGenerating(true);
    try {
      const test = await testService.generateCustom({
        title: `Practice — ${subject || "Mixed"}${topic ? ` / ${topic}` : ""}`,
        subjects: subject ? [subject] : undefined,
        topics: topic ? [topic] : undefined,
        difficulty: difficulty ? [difficulty] : undefined,
        numberOfQuestions: Math.min(20, questions.length || 10),
      });
      navigate(`/test/${test._id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not generate a practice test", "error");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-serif text-3xl font-semibold text-ink dark:text-paper">Practice Questions</h1>
      <p className="mt-1 text-ink/60 dark:text-paper/60">Browse the question bank, or start a quick practice test.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">All subjects</option>
          {facets.subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">All topics</option>
          {facets.topics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
        <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All difficulties</option>
          {difficulties.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-md border border-maroon/20 bg-maroon/5 px-4 py-3">
        <p className="flex items-center gap-2 text-sm text-ink dark:text-paper">
          <Sparkles size={16} className="text-maroon" /> Turn these {questions.length} filtered questions into a timed test.
        </p>
        <Button size="sm" onClick={startPracticeTest} disabled={generating || questions.length === 0}>
          {generating ? "Generating..." : "Start Practice Test"}
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        {loading ? (
          <FullPageSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : questions.length === 0 ? (
          <EmptyState icon={<BookOpen size={32} />} title="No questions match these filters" />
        ) : (
          questions.map((q) => (
            <Card key={q._id} className="p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge>{q.subject}</Badge>
                <Badge>{q.topic}</Badge>
                <Badge tone="gold">{q.difficulty}</Badge>
                <Badge tone="neutral">{q.questionType.replace("_", " ")}</Badge>
              </div>
              <p className="whitespace-pre-line text-sm text-ink dark:text-paper">{q.questionText}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
