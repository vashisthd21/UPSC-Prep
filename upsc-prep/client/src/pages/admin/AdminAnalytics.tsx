import { useEffect, useState } from "react";
import { Flag } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { analyticsService } from "@/services/analyticsService";
import { adminService } from "@/services/adminService";
import { useToast } from "@/components/ui/Toast";

interface ReportRow {
  _id: string;
  reason: string;
  comment?: string;
  status: string;
  question: { questionText: string; subject: string; topic: string };
  user: { name: string; email: string };
  createdAt: string;
}

interface PlatformStats {
  totalQuestions: number;
  totalAttempts: number;
  avgScore: number;
  avgAccuracy: number;
}

export function AdminAnalytics() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [p, r] = await Promise.all([
        analyticsService.platform() as Promise<PlatformStats>,
        adminService.listReports() as Promise<ReportRow[]>,
      ]);
      setStats(p);
      setReports(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load platform analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    try {
      await adminService.updateReportStatus(id, status);
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch {
      showToast("Could not update report", "error");
    }
  }

  if (loading) return <FullPageSpinner />;
  if (error || !stats) return <div className="p-8"><ErrorState message={error || "Something went wrong"} onRetry={load} /></div>;

  return (
    <div className="px-5 py-8 md:px-8">
      <h1 className="font-serif text-2xl font-semibold text-ink dark:text-paper">Platform Analytics</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Questions", value: stats.totalQuestions },
          { label: "Total Attempts", value: stats.totalAttempts },
          { label: "Avg. Score", value: stats.avgScore },
          { label: "Avg. Accuracy", value: `${stats.avgAccuracy}%` },
        ].map((c) => (
          <Card key={c.label} className="p-4">
            <p className="font-serif text-2xl font-semibold text-ink dark:text-paper">{c.value}</p>
            <p className="text-xs text-ink/60 dark:text-paper/60">{c.label}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader><h2 className="font-serif text-base font-semibold text-ink dark:text-paper">Reported Questions</h2></CardHeader>
        <CardBody>
          {reports.length === 0 ? (
            <EmptyState icon={<Flag size={28} />} title="No reports" />
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r._id} className="rounded-md border border-ink/10 dark:border-paper/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="danger">{r.reason.replace("_", " ")}</Badge>
                      <Badge tone={r.status === "OPEN" ? "gold" : "success"}>{r.status}</Badge>
                    </div>
                    <span className="text-xs text-ink/50 dark:text-paper/50">{r.user?.name} · {new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-ink dark:text-paper">{r.question?.questionText}</p>
                  {r.comment && <p className="mt-1 text-xs italic text-ink/60 dark:text-paper/60">"{r.comment}"</p>}
                  {r.status === "OPEN" && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateStatus(r._id, "RESOLVED")}>Mark Resolved</Button>
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(r._id, "DISMISSED")}>Dismiss</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
