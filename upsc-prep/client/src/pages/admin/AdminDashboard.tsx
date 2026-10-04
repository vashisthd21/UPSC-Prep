import { useEffect, useState } from "react";
import { FileQuestion, FileText, Flag, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { analyticsService } from "@/services/analyticsService";
import { adminService } from "@/services/adminService";
import { questionService } from "@/services/questionService";

interface PlatformStats {
  totalQuestions: number;
  totalAttempts: number;
  avgScore: number;
  avgAccuracy: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [reportCount, setReportCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [platform, reports, users] = await Promise.all([
        analyticsService.platform() as Promise<PlatformStats>,
        adminService.listReports("OPEN"),
        adminService.listUsers(1, 1),
      ]);
      setStats(platform);
      setReportCount(reports.length);
      setUserCount(users.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin overview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <FullPageSpinner />;
  if (error || !stats) return <div className="p-8"><ErrorState message={error || "Something went wrong"} onRetry={load} /></div>;

  const cards = [
    { label: "Total Questions", value: stats.totalQuestions, icon: FileQuestion },
    { label: "Total Attempts", value: stats.totalAttempts, icon: FileText },
    { label: "Registered Users", value: userCount, icon: Users },
    { label: "Open Reports", value: reportCount, icon: Flag },
  ];

  return (
    <div className="px-5 py-8 md:px-8">
      <h1 className="font-serif text-2xl font-semibold text-ink dark:text-paper">Admin Overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <c.icon size={18} className="text-maroon" />
            <p className="mt-2 font-serif text-2xl font-semibold text-ink dark:text-paper">{c.value}</p>
            <p className="text-xs text-ink/60 dark:text-paper/60">{c.label}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6 p-5">
        <p className="text-sm text-ink/70 dark:text-paper/70">
          Platform-wide average score: <strong className="text-ink dark:text-paper">{stats.avgScore}</strong> ·
          {" "}average accuracy: <strong className="text-ink dark:text-paper">{stats.avgAccuracy}%</strong>
        </p>
      </Card>
    </div>
  );
}
