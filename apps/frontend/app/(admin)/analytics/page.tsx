"use client";

import { adminApi, type AnalyticsData } from "@/lib/api/admin";
import { BarChart3, Brain, Database, TrendingUp, Users, BookOpen, Award } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAnalytics();
      setData(res);
    } catch (e) {
      toast.error("Failed to load analytics");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <h2 className="text-3xl font-bold text-slate-900">Analytics & Insights</h2>
        <p className="max-w-2xl text-base font-medium text-slate-600">
          Platform KPIs, quiz engagement, and revenue. Data updates as students take assessments and subscribe.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="size-5 text-slate-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Users</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "—" : data?.totalUsers ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="size-5 text-slate-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Content</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "—" : data?.totalContent ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Award className="size-5 text-slate-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quiz attempts</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "—" : data?.totalAttempts ?? 0}</p>
          <p className="mt-1 text-sm text-slate-500">Pass rate (≥70%): {loading ? "—" : `${data?.passRatePercent ?? 0}%`}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <TrendingUp className="size-5 text-slate-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue (MTD)</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "—" : `KES ${(data?.revenueMonth ?? 0).toLocaleString()}`}
          </p>
          <p className="mt-1 text-sm text-slate-500">Total: KES {(data?.revenueTotal ?? 0).toLocaleString()}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Recent quiz attempts</h3>
          <p className="text-sm text-slate-500">Latest 10 submitted attempts</p>
        </div>
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Loading...</div>
        ) : !data?.recentAttempts?.length ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">No attempts yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Correct</th>
                  <th className="px-6 py-3">Assessment</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentAttempts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">{a.scorePercent}%</td>
                    <td className="px-6 py-3 text-slate-600">{a.correctCount} / {a.totalQuestions}</td>
                    <td className="px-6 py-3 text-slate-600">{a.assessmentId}</td>
                    <td className="px-6 py-3 text-slate-600">{formatDate(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Database className="size-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Data</h3>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            All metrics are derived from users, content, quiz attempts, and subscription payments in this platform.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <BarChart3 className="size-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Pass rate</h3>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Pass rate is the share of quiz attempts with score ≥ 70%. It updates as students submit attempts.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Brain className="size-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Revenue</h3>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Revenue is recorded when a user activates a subscription plan. Connect payments for more detail.
          </p>
        </div>
      </section>
    </div>
  );
}
