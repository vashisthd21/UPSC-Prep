import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { AlertCircle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { analyticsService } from "@/services/analyticsService";
import { OverviewAnalytics, SubjectAnalytic, TopicAnalytic } from "@/types";

const COLORS = ["#2F6D4F", "#B23A3A", "#B8860B"];

export function Analytics() {
  const [overview, setOverview] = useState<OverviewAnalytics | null>(null);
  const [subjects, setSubjects] = useState<SubjectAnalytic[]>([]);
  const [topicsData, setTopicsData] = useState<{ topics: TopicAnalytic[]; weakTopics: TopicAnalytic[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [ov, subj, top] = await Promise.all([
        analyticsService.overview(),
        analyticsService.subjects(),
        analyticsService.topics(),
      ]);
      setOverview(ov);
      setSubjects(subj);
      setTopicsData(top);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <FullPageSpinner />;
  if (error || !overview) return <div className="p-8"><ErrorState message={error || "Something went wrong"} onRetry={load} /></div>;

  const totalAnswered = overview.scoreTrend.length
    ? overview.questionsSolved
    : 0;
  const pieData = [
    { name: "Correct", value: subjects.reduce((s, x) => s + x.correct, 0) },
    { name: "Incorrect", value: subjects.reduce((s, x) => s + (x.attempted - x.correct), 0) },
  ];

  return (
    <div className="px-5 py-8 md:px-8">
      <h1 className="font-serif text-2xl font-semibold text-ink dark:text-paper">Performance Analytics</h1>
      <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">Based on {overview.testsAttempted} submitted tests.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><h2 className="font-serif text-base font-semibold text-ink dark:text-paper">Subject-wise Accuracy</h2></CardHeader>
          <CardBody>
            {subjects.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink/50 dark:text-paper/50">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={subjects} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="text-ink/10 dark:text-paper/10" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="subject" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#7A2E2E" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="font-serif text-base font-semibold text-ink dark:text-paper">Correct vs Incorrect</h2></CardHeader>
          <CardBody>
            {totalAnswered === 0 ? (
              <p className="py-10 text-center text-sm text-ink/50 dark:text-paper/50">No attempted questions yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><h2 className="font-serif text-base font-semibold text-ink dark:text-paper">Topic-wise Accuracy</h2></CardHeader>
          <CardBody>
            {!topicsData || topicsData.topics.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink/50 dark:text-paper/50">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(220, topicsData.topics.length * 32)}>
                <BarChart data={topicsData.topics} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="text-ink/10 dark:text-paper/10" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="topic" width={200} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#B8860B" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><h2 className="font-serif text-base font-semibold text-ink dark:text-paper">Weak Topics</h2></CardHeader>
          <CardBody>
            {!topicsData || topicsData.weakTopics.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink/50 dark:text-paper/50">
                Not enough data yet — weak topics appear once you've attempted at least 3 questions in a topic.
              </p>
            ) : (
              <div className="space-y-2">
                {topicsData.weakTopics.map((t) => (
                  <div key={t.topic} className="flex items-center justify-between rounded-md border border-danger/20 bg-danger/5 px-4 py-2.5 text-sm">
                    <span className="flex items-center gap-2 text-ink dark:text-paper">
                      <AlertCircle size={14} className="text-danger" /> {t.topic} <span className="text-ink/40 dark:text-paper/40">({t.subject})</span>
                    </span>
                    <span className="font-medium text-danger">{t.accuracy}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
