import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, Clock, ListChecks, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { QuestionPalette } from "@/components/shared/QuestionPalette";
import { attemptService } from "@/services/attemptService";
import { testService } from "@/services/testService";
import { AnswerStatus, Question, Test, TestAttempt } from "@/types";
import { useTimer } from "@/hooks/useTimer";
import { useToast } from "@/components/ui/Toast";

type LocalAnswer = { selected?: "A" | "B" | "C" | "D"; status: AnswerStatus };

export function TestInterface() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [test, setTest] = useState<Test | null>(null);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<LocalAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const questionEnterTime = useRef<number>(Date.now());
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!testId) return;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [attemptData, testData, questionData] = await Promise.all([
          attemptService.start(testId!),
          testService.get(testId!),
          testService.getQuestions(testId!),
        ]);
        setAttempt(attemptData);
        setTest(testData);
        setQuestions(questionData);
        setAnswers(
          questionData.map((q) => {
            const existing = attemptData.answers.find((a) => a.question === q._id);
            return { selected: existing?.selected, status: existing?.status || "UNVISITED" };
          })
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load the test");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [testId]);

  const endsAt = useMemo(() => {
    if (!attempt) return Date.now();
    return new Date(attempt.startedAt).getTime() + attempt.durationMinutes * 60 * 1000;
  }, [attempt]);

  const handleAutoSubmit = useCallback(() => {
    if (submittedRef.current || !attempt) return;
    submittedRef.current = true;
    attemptService
      .submit(attempt._id, true)
      .then(() => navigate(`/result/${attempt._id}`, { replace: true }))
      .catch(() => showToast("Could not auto-submit — please check your connection", "error"));
  }, [attempt, navigate, showToast]);

  const { secondsLeft, formatted, isLow } = useTimer(endsAt, { onExpire: handleAutoSubmit });

  // Warn before accidental navigation/refresh while the attempt is active.
  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (attempt?.status === "IN_PROGRESS") {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [attempt]);

  function markVisitedIfNeeded(index: number) {
    setAnswers((prev) => {
      const copy = [...prev];
      if (copy[index].status === "UNVISITED") copy[index] = { ...copy[index], status: "VISITED" };
      return copy;
    });
  }

  useEffect(() => {
    markVisitedIfNeeded(currentIndex);
    questionEnterTime.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  async function persistAnswer(index: number, override?: Partial<LocalAnswer>) {
    if (!attempt) return;
    const question = questions[index];
    const current = { ...answers[index], ...override };
    const timeSpentSeconds = Math.max(0, Math.round((Date.now() - questionEnterTime.current) / 1000));
    try {
      await attemptService.saveAnswer(attempt._id, {
        questionId: question._id,
        selected: current.selected ?? null,
        status: current.status,
        timeSpentSeconds,
      });
    } catch {
      showToast("Could not save your answer — check your connection", "error");
    }
  }

  function selectOption(key: "A" | "B" | "C" | "D") {
    setAnswers((prev) => {
      const copy = [...prev];
      const wasReview = copy[currentIndex].status === "MARKED_FOR_REVIEW" || copy[currentIndex].status === "ANSWERED_REVIEW";
      copy[currentIndex] = {
        selected: key,
        status: wasReview ? "ANSWERED_REVIEW" : "ANSWERED",
      };
      return copy;
    });
  }

  function clearResponse() {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = { selected: undefined, status: "VISITED" };
      return copy;
    });
    persistAnswer(currentIndex, { selected: undefined, status: "VISITED" });
  }

  function toggleMarkForReview() {
    setAnswers((prev) => {
      const copy = [...prev];
      const cur = copy[currentIndex];
      const nextStatus: AnswerStatus = cur.selected
        ? cur.status === "ANSWERED_REVIEW" ? "ANSWERED" : "ANSWERED_REVIEW"
        : cur.status === "MARKED_FOR_REVIEW" ? "VISITED" : "MARKED_FOR_REVIEW";
      copy[currentIndex] = { ...cur, status: nextStatus };
      persistAnswer(currentIndex, { status: nextStatus });
      return copy;
    });
  }

  async function saveAndNext() {
    await persistAnswer(currentIndex);
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  }

  function goPrevious() {
    persistAnswer(currentIndex);
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function jumpTo(index: number) {
    persistAnswer(currentIndex);
    setPaletteOpen(false);
    setCurrentIndex(index);
  }

  async function handleSubmit() {
    if (!attempt) return;
    setSubmitting(true);
    await persistAnswer(currentIndex);
    try {
      submittedRef.current = true;
      await attemptService.submit(attempt._id, false);
      navigate(`/result/${attempt._id}`, { replace: true });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not submit the test", "error");
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <FullPageSpinner />;
  if (error || !test || !attempt || questions.length === 0) {
    return (
      <div className="p-8">
        <ErrorState message={error || "This test has no questions"} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const q = questions[currentIndex];
  const answeredCount = answers.filter((a) => a.status === "ANSWERED" || a.status === "ANSWERED_REVIEW").length;
  const markedCount = answers.filter((a) => a.status === "MARKED_FOR_REVIEW" || a.status === "ANSWERED_REVIEW").length;
  const unattemptedCount = questions.length - answeredCount;

  return (
    <div className="flex h-screen flex-col bg-paper dark:bg-ink">
      <header className="flex items-center justify-between gap-3 border-b border-ink/10 dark:border-paper/10 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink dark:text-paper">{test.title}</p>
          <p className="text-xs text-ink/50 dark:text-paper/50">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-mono font-semibold ${
            isLow ? "bg-danger/10 text-danger animate-pulse" : "bg-ink/5 text-ink dark:bg-paper/10 dark:text-paper"
          }`}
        >
          <Clock size={15} /> {formatted}
        </div>
        <button
          onClick={() => setPaletteOpen(true)}
          className="lg:hidden rounded-md border border-ink/15 p-2 text-ink dark:border-paper/15 dark:text-paper"
          aria-label="Open question palette"
        >
          <ListChecks size={18} />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 px-5 py-6 md:px-10 md:py-8">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded bg-ink/5 px-2 py-0.5 text-ink/60 dark:bg-paper/10 dark:text-paper/60">{q.subject}</span>
              <span className="rounded bg-ink/5 px-2 py-0.5 text-ink/60 dark:bg-paper/10 dark:text-paper/60">{q.topic}</span>
              <span className="rounded bg-gold/10 px-2 py-0.5 text-gold">{q.difficulty}</span>
            </div>
            <p className="whitespace-pre-line text-base leading-relaxed text-ink dark:text-paper md:text-lg">
              <span className="mr-2 font-semibold">{currentIndex + 1}.</span>
              {q.questionText}
            </p>

            <div className="mt-6 space-y-3 max-w-2xl">
              {q.options.map((opt) => {
                const selected = answers[currentIndex]?.selected === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => selectOption(opt.key)}
                    className={`flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                      selected
                        ? "border-maroon bg-maroon/5 text-ink dark:text-paper"
                        : "border-ink/15 text-ink hover:border-ink/30 dark:border-paper/15 dark:text-paper"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                        selected ? "border-maroon bg-maroon text-white" : "border-ink/30 dark:border-paper/30"
                      }`}
                    >
                      {opt.key}
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink px-5 py-4 md:px-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={goPrevious} disabled={currentIndex === 0}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={clearResponse}>
                  Clear Response
                </Button>
                <Button variant="secondary" size="sm" onClick={toggleMarkForReview}>
                  Mark for Review
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveAndNext} disabled={currentIndex === questions.length - 1}>
                  Save &amp; Next
                </Button>
                <Button variant="danger" size="sm" onClick={() => setConfirmSubmit(true)}>
                  Submit Test
                </Button>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-l lg:border-ink/10 lg:dark:border-paper/10 lg:overflow-y-auto lg:px-5 lg:py-6">
          <p className="mb-4 text-sm font-semibold text-ink dark:text-paper">Question Palette</p>
          <QuestionPalette
            total={questions.length}
            statuses={answers.map((a) => a.status)}
            currentIndex={currentIndex}
            onJump={jumpTo}
          />
        </aside>
      </div>

      {paletteOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setPaletteOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto rounded-t-xl bg-paper dark:bg-ink px-5 py-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-ink dark:text-paper">Question Palette</p>
              <button onClick={() => setPaletteOpen(false)} className="text-ink/60 dark:text-paper/60"><X size={20} /></button>
            </div>
            <QuestionPalette
              total={questions.length}
              statuses={answers.map((a) => a.status)}
              currentIndex={currentIndex}
              onJump={jumpTo}
            />
          </div>
        </div>
      )}

      <Modal open={confirmSubmit} onClose={() => setConfirmSubmit(false)} title="Submit test?">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-gold" size={20} />
          <div className="text-sm text-ink/80 dark:text-paper/80">
            <p>You have answered {answeredCount} of {questions.length} questions.</p>
            <p className="mt-1">{unattemptedCount} unattempted, {markedCount} marked for review. This cannot be undone.</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmSubmit(false)}>
            Keep reviewing
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Test"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
