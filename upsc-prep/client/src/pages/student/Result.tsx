import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, MinusCircle, Trophy } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { attemptService } from "@/services/attemptService";
import { testService } from "@/services/testService";
import { Test, TestAttempt } from "@/types";

export function Result() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!attemptId) return;
    setLoading(true);
    setError(null);
    try {
      const a = await attemptService.get(attemptId);
      setAttempt(a);
      const t = await testService.get(typeof a.test === "string" ? a.test : a.test._id);
      setTest(t);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load result");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  if (loading) return <FullPageSpinner />;
  if (error || !attempt || !test) {
    return <div className="p-8"><ErrorState message={error || "Result not found"} onRetry={load} /></div>;
  }

  const maxScore = test.questions.length * test.settings.marksPerCorrect;
  const minutes = Math.floor(attempt.timeTakenSeconds / 60);
  const seconds = attempt.timeTakenSeconds % 60;

  const stats = [
    { label: "Correct", value: attempt.correctCount, icon: CheckCircle2, tone: "text-success" },
    { label: "Incorrect", value: attempt.incorrectCount, icon: XCircle, tone: "text-danger" },
    { label: "Unattempted", value: attempt.unattemptedCount, icon: MinusCircle, tone: "text-ink/50 dark:text-paper/50" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="text-center">
        <Trophy className="mx-auto text-maroon" size={36} />
        <h1 className="mt-3 font-serif text-2xl font-semibold text-ink dark:text-paper">Test Completed</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">{test.title}</p>
      </div>

      <Card className="mt-8 p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-ink/50 dark:text-paper/50">Your Score</p>
        <p className="mt-1 font-serif text-4xl font-semibold text-maroon">
          {attempt.score} <span className="text-lg text-ink/40 dark:text-paper/40">/ {maxScore}</span>
        </p>
        <div className="mt-4 flex justify-center gap-8 text-sm text-ink/60 dark:text-paper/60">
          <span>Accuracy: <strong className="text-ink dark:text-paper">{attempt.accuracy}%</strong></span>
          <span>Time: <strong className="text-ink dark:text-paper">{minutes}m {seconds}s</strong></span>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <s.icon className={`mx-auto ${s.tone}`} size={22} />
            <p className="mt-2 font-serif text-xl font-semibold text-ink dark:text-paper">{s.value}</p>
            <p className="text-xs text-ink/60 dark:text-paper/60">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardBody className="flex flex-wrap justify-center gap-3">
          <Link to={`/review/${attempt._id}`}>
            <Button>Review Answers</Button>
          </Link>
          <Button variant="outline" onClick={() => navigate(`/test/${typeof attempt.test === "string" ? attempt.test : attempt.test._id}`)}>
            Retry Test
          </Button>
          <Link to="/analytics">
            <Button variant="outline">Practice Weak Areas</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
