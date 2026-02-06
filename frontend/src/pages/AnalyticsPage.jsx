import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import Heatmap from "../components/Heatmap";
import { fetchAnalytics } from "../services/analyticsService";
import { fetchMoodTrendInsight } from "../services/aiService";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [insight, setInsight] = useState("");

  useEffect(() => {
    fetchAnalytics().then(setData);
    fetchMoodTrendInsight()
      .then((res) => setInsight(res.response || ""))
      .catch(() => {});
  }, []);

  const moodTrend = data?.moodTrend || [];
  const moodDistribution = data?.moodDistribution || [];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Mood Analytics"
        subtitle="Your emotional rhythm, visualized."
        action={
          <Link
            to="/reflection"
            className="rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm"
          >
            Weekly Reflection
          </Link>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Current Streak" value={`${data?.streak?.current_streak || 0} days`} />
        <StatCard label="Longest Streak" value={`${data?.streak?.longest_streak || 0} days`} />
        <StatCard label="Last Entry" value={data?.streak?.last_entry_date?.slice(0, 10) || "—"} />
      </div>
      {insight && (
        <div className="card glass p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI Trend Insight</p>
          <p className="mt-2 text-sm text-slate-600">{insight}</p>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card glass p-5">
          <h3 className="text-lg font-semibold text-ink">Mood Trend</h3>
          <Line
            data={{
              labels: moodTrend.map((item) => item.day),
              datasets: [
                {
                  label: "Mood score",
                  data: moodTrend.map((item) => item.avg_score),
                  borderColor: "#7C3AED",
                  backgroundColor: "rgba(124, 58, 237, 0.2)",
                  tension: 0.4,
                },
              ],
            }}
          />
        </div>
        <div className="card glass p-5">
          <h3 className="text-lg font-semibold text-ink">Emotional Mix</h3>
          <Pie
            data={{
              labels: moodDistribution.map((item) => `${item.emoji} ${item.label}`),
              datasets: [
                {
                  data: moodDistribution.map((item) => item.count),
                  backgroundColor: ["#7C3AED", "#38BDF8", "#FBD38D", "#9AE6B4", "#FEB2B2"],
                },
              ],
            }}
          />
        </div>
      </div>
      <div className="card glass p-5">
        <h3 className="text-lg font-semibold text-ink">Writing Heatmap</h3>
        <p className="text-sm text-slate-500">Last 4 weeks of activity</p>
        <div className="mt-4">
          <Heatmap data={data?.heatmap || []} />
        </div>
      </div>
    </div>
  );
}
