import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, UploadCloud, Flag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { questionService } from "@/services/questionService";
import { Question, QuestionType, Difficulty } from "@/types";
import { useToast } from "@/components/ui/Toast";

const difficulties: Difficulty[] = ["Easy", "Medium", "Hard", "Very Hard"];
const questionTypes: QuestionType[] = [
  "MCQ", "STATEMENT", "ASSERTION_REASON", "MATCH_FOLLOWING", "CHRONOLOGY", "COUNT_STATEMENTS", "CONCEPT_APPLICATION", "PYQ",
];

type FormState = {
  _id?: string;
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  upscTakeaway: string;
  subject: string;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  isPYQ: boolean;
  year: string;
  source: string;
};

const emptyForm: FormState = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "A",
  explanation: "",
  upscTakeaway: "",
  subject: "",
  topic: "",
  subtopic: "",
  difficulty: "Medium",
  questionType: "STATEMENT",
  isPYQ: false,
  year: "",
  source: "",
};

export function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkResult, setBulkResult] = useState<{ insertedCount: number; invalidCount: number; duplicateCount: number } | null>(null);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await questionService.list({ limit: 50, reveal: true });
      setQuestions(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(q: Question) {
    setForm({
      _id: q._id,
      questionText: q.questionText,
      options: q.options.map((o) => o.text) as [string, string, string, string],
      correctAnswer: q.correctAnswer || "A",
      explanation: q.explanation || "",
      upscTakeaway: q.upscTakeaway || "",
      subject: q.subject,
      topic: q.topic,
      subtopic: q.subtopic || "",
      difficulty: q.difficulty,
      questionType: q.questionType,
      isPYQ: q.isPYQ,
      year: q.year ? String(q.year) : "",
      source: q.source || "",
    });
    setFormOpen(true);
  }

  async function saveQuestion() {
    if (form.isPYQ && !form.year) {
      showToast("PYQ questions must include a year", "error");
      return;
    }
    setSaving(true);
    const payload = {
      questionText: form.questionText,
      options: form.options.map((text, i) => ({ key: "ABCD"[i] as "A" | "B" | "C" | "D", text })),
      correctAnswer: form.correctAnswer,
      explanation: form.explanation,
      upscTakeaway: form.upscTakeaway || undefined,
      subject: form.subject,
      topic: form.topic,
      subtopic: form.subtopic || undefined,
      difficulty: form.difficulty,
      questionType: form.questionType,
      isPYQ: form.isPYQ,
      year: form.year ? Number(form.year) : undefined,
      source: form.source || undefined,
    };
    try {
      if (form._id) {
        await questionService.update(form._id, payload);
        showToast("Question updated", "success");
      } else {
        await questionService.create(payload);
        showToast("Question created", "success");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save question", "error");
    } finally {
      setSaving(false);
    }
  }

  async function removeQuestion(id: string) {
    if (!window.confirm("Remove this question? It will be hidden from students but kept for existing attempts.")) return;
    try {
      await questionService.remove(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch {
      showToast("Could not remove question", "error");
    }
  }

  async function runBulkImport() {
    try {
      const parsed = JSON.parse(bulkText);
      const rows = Array.isArray(parsed) ? parsed : parsed.questions;
      const result = await questionService.bulkImport(rows);
      setBulkResult(result);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Invalid JSON", "error");
    }
  }

  return (
    <div className="px-5 py-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink dark:text-paper">Question Management</h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">{questions.length} questions loaded</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setBulkOpen(true); setBulkResult(null); }}>
            <UploadCloud size={16} className="mr-1.5" /> Bulk Import
          </Button>
          <Button onClick={openCreate}><Plus size={16} className="mr-1.5" /> Add Question</Button>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <FullPageSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : questions.length === 0 ? (
          <EmptyState title="No questions yet" description='Add one, or run the seed script.' />
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <Card key={q._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2 mb-1.5">
                      <Badge>{q.subject}</Badge>
                      <Badge>{q.topic}</Badge>
                      <Badge tone="gold">{q.difficulty}</Badge>
                      <Badge tone="neutral">{q.questionType.replace("_", " ")}</Badge>
                      {q.isPYQ && <Badge tone="maroon">PYQ {q.year}</Badge>}
                    </div>
                    <p className="line-clamp-2 text-sm text-ink dark:text-paper">{q.questionText}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(q)} className="p-2 text-ink/50 hover:text-maroon dark:text-paper/50" aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => removeQuestion(q._id)} className="p-2 text-ink/50 hover:text-danger dark:text-paper/50" aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={form._id ? "Edit Question" : "Add Question"} widthClass="max-w-2xl">
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1 scrollbar-thin">
          <div>
            <Label>Question text</Label>
            <Textarea rows={3} value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {form.options.map((opt, i) => (
              <div key={i}>
                <Label>Option {"ABCD"[i]}</Label>
                <Input
                  value={opt}
                  onChange={(e) => {
                    const next = [...form.options] as [string, string, string, string];
                    next[i] = e.target.value;
                    setForm({ ...form, options: next });
                  }}
                />
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Correct answer</Label>
              <Select value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value as FormState["correctAnswer"] })}>
                {["A", "B", "C", "D"].map((k) => <option key={k} value={k}>{k}</option>)}
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}>
                {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </div>
            <div>
              <Label>Question type</Label>
              <Select value={form.questionType} onChange={(e) => setForm({ ...form, questionType: e.target.value as QuestionType })}>
                {questionTypes.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div>
              <Label>Topic</Label>
              <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Subtopic (optional)</Label>
              <Input value={form.subtopic} onChange={(e) => setForm({ ...form, subtopic: e.target.value })} />
            </div>
            <div>
              <Label>Source (optional)</Label>
              <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Explanation</Label>
            <Textarea rows={3} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
          </div>
          <div>
            <Label>UPSC Takeaway (optional)</Label>
            <Input value={form.upscTakeaway} onChange={(e) => setForm({ ...form, upscTakeaway: e.target.value })} />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-ink dark:text-paper">
              <input type="checkbox" checked={form.isPYQ} onChange={(e) => setForm({ ...form, isPYQ: e.target.checked })} />
              This is an actual UPSC Previous Year Question
            </label>
            {form.isPYQ && (
              <Input
                type="number"
                placeholder="Year"
                className="w-28"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={saveQuestion} disabled={saving}>{saving ? "Saving..." : "Save Question"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title="Bulk Import Questions" widthClass="max-w-2xl">
        <p className="text-sm text-ink/60 dark:text-paper/60">
          Paste a JSON array of question objects (see README for the schema).
        </p>
        <Textarea
          rows={10}
          className="mt-3 font-mono text-xs"
          placeholder='[{"questionText": "...", "options": ["A","B","C","D"], "correctAnswer": "A", ...}]'
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
        />
        {bulkResult && (
          <div className="mt-3 rounded-md bg-ink/5 dark:bg-paper/10 px-4 py-3 text-sm">
            <p className="text-success">Inserted: {bulkResult.insertedCount}</p>
            <p className="text-danger">Invalid: {bulkResult.invalidCount}</p>
            <p className="text-ink/60 dark:text-paper/60">Duplicates skipped: {bulkResult.duplicateCount}</p>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setBulkOpen(false)}>Close</Button>
          <Button onClick={runBulkImport}>Import</Button>
        </div>
      </Modal>
    </div>
  );
}
