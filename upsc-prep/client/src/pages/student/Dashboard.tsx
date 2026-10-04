import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Flame, FileText, Target, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { analyticsService } from "@/services/analyticsService";
import { attemptService } from "@/services/attemptService";
import { OverviewAnalytics, TestAttempt, Test } from "@/types";
import { useAuth } from "@/hooks/useAuth";

const quickActions = [
  { to: "/mock-tests", label: "Start Mock Test", icon: FileText },
  { to: "/practice", label: "Practice Questions", icon: Target },
  { to: "/pyqs", label: "PYQs", icon: TrendingUp },
  { to: "/analytics", label: "View Analytics", icon: LineChart },
];

export function Dashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<OverviewAnalytics | null>(null);
  const [recent, setRecent] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [ov, history] = await Promise.all([
        analyticsService.overview(),
        attemptService.history(1, 5),
      ]);
      setOverview(ov);
      setRecent(history.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <FullPageSpinner />;
  if (error || !overview) return <div className="p-8"><ErrorState message={error || "Something went wrong"} onRetry={load} /></div>;

  const cards = [
    { label: "Tests Attempted", value: overview.testsAttempted, icon: FileText },
    { label: "Questions Solved", value: overview.questionsSolved, icon: Target },
    { label: "Avg. Accuracy", value: `${overview.avgAccuracy}%`, icon: TrendingUp },
    { label: "Avg. Score", value: overview.avgScore, icon: LineChart },
    { label: "Current Streak", value: `${overview.currentStreak}d`, icon: Flame },
  ];

  return (
    <div className="px-5 py-8 md:px-8">
      <h1 className="font-serif text-2xl font-semibold text-ink dark:text-paper">
        Welcome back, {user?.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">Here's how your preparation is going.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <c.icon size={18} className="text-maroon" />
            <p className="mt-2 font-serif text-2xl font-semibold text-ink dark:text-paper">{c.value}</p>
            <p className="text-xs text-ink/60 dark:text-paper/60">{c.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-serif text-base font-semibold text-ink dark:text-paper">Score vs Test Number</h2>
          </CardHeader>
          <CardBody>
            {overview.scoreTrend.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink/50 dark:text-paper/50">
                Attempt a test to see your score trend here.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={overview.scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink/10 dark:text-paper/10" />
                  <XAxis dataKey="testNumber" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#7A2E2E" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-serif text-base font-semibold text-ink dark:text-paper">Quick Actions</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {quickActions.map((a) => (
              <Link key={a.to} to={a.to} className="flex items-center justify-between rounded-md border border-ink/10 dark:border-paper/10 px-4 py-3 text-sm hover:border-maroon">
                <span className="flex items-center gap-2 text-ink dark:text-paper">
                  <a.icon size={16} className="text-maroon" /> {a.label}
                </span>
                <ArrowRight size={14} className="text-ink/40" />
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold text-ink dark:text-paper">Recent Tests</h2>
          <Link to="/history" className="text-sm font-medium text-maroon">View all</Link>
        </CardHeader>
        <CardBody className="overflow-x-auto scrollbar-thin">
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/50 dark:text-paper/50">No tests attempted yet.</p>
          ) : (
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-ink/50 dark:text-paper/50">
                  <th className="py-2 font-medium">Test</th>
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Score</th>
                  <th className="py-2 font-medium">Accuracy</th>
                  <th className="py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r._id} className="border-t border-ink/5 dark:border-paper/5">
                    <td className="py-2.5 text-ink dark:text-paper">{(r.test as Test)?.title || "Test"}</td>
                    <td className="py-2.5 text-ink/70 dark:text-paper/70">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-2.5 text-ink/70 dark:text-paper/70">{r.score}</td>
                    <td className="py-2.5 text-ink/70 dark:text-paper/70">{r.accuracy}%</td>
                    <td className="py-2.5">
                      <Link to={`/result/${r._id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
