import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { testService } from "@/services/testService";
import { questionService } from "@/services/questionService";
import { Test, TestType } from "@/types";
import { useToast } from "@/components/ui/Toast";

const testTypes: TestType[] = ["FULL_LENGTH", "SUBJECT", "TOPIC", "PYQ", "CUSTOM"];

export function AdminTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [facets, setFacets] = useState<{ subjects: string[]; topics: string[] }>({ subjects: [], topics: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTest, setEditTest] = useState<Test | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    testType: "TOPIC" as TestType,
    subject: "",
    topic: "",
    numberOfQuestions: 10,
    durationMinutes: 20,
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await testService.list({ limit: 50 });
      setTests(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    questionService.facets().then((f) => setFacets({ subjects: f.subjects, topics: f.topics })).catch(() => undefined);
  }, []);

  async function createTest() {
    setSaving(true);
    try {
      await testService.generateCustom({
        title: form.title || undefined,
        subjects: form.subject ? [form.subject] : undefined,
        topics: form.topic ? [form.topic] : undefined,
        numberOfQuestions: form.numberOfQuestions,
        durationMinutes: form.durationMinutes,
      });
      showToast("Test created", "success");
      setCreateOpen(false);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not create test", "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editTest) return;
    setSaving(true);
    try {
      await testService.update(editTest._id, {
        title: editTest.title,
        description: editTest.description,
        settings: editTest.settings,
        isPublished: editTest.isPublished,
      });
      showToast("Test updated", "success");
      setEditTest(null);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update test", "error");
    } finally {
      setSaving(false);
    }
  }

  async function removeTest(id: string) {
    if (!window.confirm("Unpublish this test? Existing attempts remain visible to students.")) return;
    try {
      await testService.remove(id);
      setTests((prev) => prev.filter((t) => t._id !== id));
    } catch {
      showToast("Could not remove test", "error");
    }
  }

  return (
    <div className="px-5 py-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink dark:text-paper">Test Management</h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">{tests.length} tests</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-1.5" /> Create Test</Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <FullPageSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : tests.length === 0 ? (
          <EmptyState title="No tests yet" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tests.map((t) => (
              <Card key={t._id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge tone="maroon">{t.testType.replace("_", " ")}</Badge>
                    <h3 className="mt-2 font-serif font-semibold text-ink dark:text-paper">{t.title}</h3>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditTest(t)} className="p-2 text-ink/50 hover:text-maroon dark:text-paper/50"><Pencil size={16} /></button>
                    <button onClick={() => removeTest(t._id)} className="p-2 text-ink/50 hover:text-danger dark:text-paper/50"><Trash2 size={16} /></button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-ink/60 dark:text-paper/60">
                  {t.totalQuestions ?? t.questions?.length ?? 0} questions · {t.settings.durationMinutes} min ·
                  {" "}Attempted {t.attemptCount} time{t.attemptCount === 1 ? "" : "s"}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Test">
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Topic Test — Revolt of 1857" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Subject</Label>
              <Select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                <option value="">Any</option>
                {facets.subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <Label>Topic</Label>
              <Select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                <option value="">Any</option>
                {facets.topics.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Number of questions</Label>
              <Input type="number" min={1} value={form.numberOfQuestions} onChange={(e) => setForm({ ...form, numberOfQuestions: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" min={5} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createTest} disabled={saving}>{saving ? "Creating..." : "Create Test"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(editTest)} onClose={() => setEditTest(null)} title="Edit Test">
        {editTest && (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={editTest.title} onChange={(e) => setEditTest({ ...editTest, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={2} value={editTest.description || ""} onChange={(e) => setEditTest({ ...editTest, description: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Marks / correct</Label>
                <Input type="number" step="0.01" value={editTest.settings.marksPerCorrect} onChange={(e) => setEditTest({ ...editTest, settings: { ...editTest.settings, marksPerCorrect: Number(e.target.value) } })} />
              </div>
              <div>
                <Label>Negative marks</Label>
                <Input type="number" step="0.01" value={editTest.settings.negativeMarks} onChange={(e) => setEditTest({ ...editTest, settings: { ...editTest.settings, negativeMarks: Number(e.target.value) } })} />
              </div>
              <div>
                <Label>Duration (min)</Label>
                <Input type="number" value={editTest.settings.durationMinutes} onChange={(e) => setEditTest({ ...editTest, settings: { ...editTest.settings, durationMinutes: Number(e.target.value) } })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditTest(null)}>Cancel</Button>
              <Button onClick={saveEdit} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
