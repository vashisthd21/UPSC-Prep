import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bookmark, BookmarkCheck, CheckCircle2, Flag, MinusCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select, Textarea } from "@/components/ui/Input";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { attemptService } from "@/services/attemptService";
import { bookmarkService } from "@/services/bookmarkService";
import { adminService } from "@/services/adminService";
import { ReviewItem } from "@/types";
import { useToast } from "@/components/ui/Toast";

const reportReasons = [
  { value: "INCORRECT_ANSWER", label: "Incorrect answer" },
  { value: "AMBIGUOUS_QUESTION", label: "Ambiguous question" },
  { value: "INCORRECT_EXPLANATION", label: "Incorrect explanation" },
  { value: "TYPO", label: "Typo" },
  { value: "OTHER", label: "Other" },
];

export function Review() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { showToast } = useToast();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("INCORRECT_ANSWER");
  const [reportComment, setReportComment] = useState("");

  async function load() {
    if (!attemptId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await attemptService.review(attemptId);
      setItems(data.review);
      const marks = await bookmarkService.list();
      setBookmarked(new Set(marks.map((m) => m.question._id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load review");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  async function toggleBookmark(questionId: string) {
    try {
      if (bookmarked.has(questionId)) {
        await bookmarkService.remove(questionId);
        setBookmarked((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
      } else {
        await bookmarkService.add(questionId);
        setBookmarked((prev) => new Set(prev).add(questionId));
      }
    } catch {
      showToast("Could not update bookmark", "error");
    }
  }

  async function submitReport() {
    if (!reportTarget) return;
    try {
      await adminService.createReport({ questionId: reportTarget, reason: reportReason, comment: reportComment });
      showToast("Report submitted — thank you", "success");
      setReportTarget(null);
      setReportComment("");
    } catch {
      showToast("Could not submit report", "error");
    }
  }

  if (loading) return <FullPageSpinner />;
  if (error) return <div className="p-8"><ErrorState message={error} onRetry={load} /></div>;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-serif text-2xl font-semibold text-ink dark:text-paper">Review Answers</h1>
      <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">{items.length} questions</p>

      <div className="mt-8 space-y-6">
        {items.map((item, i) => {
          const status = item.selected
            ? item.isCorrect
              ? { label: "Correct", icon: CheckCircle2, tone: "text-success" }
              : { label: "Incorrect", icon: XCircle, tone: "text-danger" }
            : { label: "Unattempted", icon: MinusCircle, tone: "text-ink/50 dark:text-paper/50" };

          return (
            <Card key={item.question._id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge>{item.question.subject}</Badge>
                  <Badge>{item.question.topic}</Badge>
                  {item.question.isPYQ && <Badge tone="maroon">PYQ {item.question.year}</Badge>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleBookmark(item.question._id)} className="p-1.5 text-ink/50 hover:text-maroon dark:text-paper/50" aria-label="Bookmark">
                    {bookmarked.has(item.question._id) ? <BookmarkCheck size={17} className="text-maroon" /> : <Bookmark size={17} />}
                  </button>
                  <button onClick={() => setReportTarget(item.question._id)} className="p-1.5 text-ink/50 hover:text-danger dark:text-paper/50" aria-label="Report">
                    <Flag size={17} />
                  </button>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm text-ink dark:text-paper">
                <span className="mr-2 font-semibold">{i + 1}.</span>
                {item.question.questionText}
              </p>

              <div className="mt-4 space-y-2">
                {item.question.options.map((opt) => {
                  const isCorrectOpt = opt.key === item.question.correctAnswer;
                  const isSelected = opt.key === item.selected;
                  return (
                    <div
                      key={opt.key}
                      className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm ${
                        isCorrectOpt
                          ? "border-success bg-success/5 text-ink dark:text-paper"
                          : isSelected
                          ? "border-danger bg-danger/5 text-ink dark:text-paper"
                          : "border-ink/10 text-ink/70 dark:border-paper/10 dark:text-paper/70"
                      }`}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold border-ink/30 dark:border-paper/30">
                        {opt.key}
                      </span>
                      {opt.text}
                      {isCorrectOpt && <CheckCircle2 size={14} className="ml-auto text-success shrink-0" />}
                      {isSelected && !isCorrectOpt && <XCircle size={14} className="ml-auto text-danger shrink-0" />}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
                <status.icon size={14} className={status.tone} />
                <span className={status.tone}>{status.label}</span>
              </div>

              {item.question.explanation && (
                <div className="mt-4 rounded-md bg-ink/[0.03] dark:bg-paper/[0.05] px-4 py-3 text-sm text-ink/80 dark:text-paper/80">
                  <p className="font-medium text-ink dark:text-paper">Explanation</p>
                  <p className="mt-1 whitespace-pre-line">{item.question.explanation}</p>
                  {item.question.upscTakeaway && (
                    <p className="mt-2 text-xs italic text-maroon">UPSC Takeaway: {item.question.upscTakeaway}</p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Modal open={Boolean(reportTarget)} onClose={() => setReportTarget(null)} title="Report this question">
        <div className="space-y-4">
          <Select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
            {reportReasons.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </Select>
          <Textarea
            rows={3}
            placeholder="Optional details..."
            value={reportComment}
            onChange={(e) => setReportComment(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReportTarget(null)}>Cancel</Button>
            <Button onClick={submitReport}>Submit Report</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
