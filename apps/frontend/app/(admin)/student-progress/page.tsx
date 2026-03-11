"use client";

import { adminApi, type ProgressItem } from "@/lib/api/admin";
import { BarChart3, LineChart, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function StudentProgressPage() {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProgress();
      setProgress(data);
    } catch (e) {
      toast.error("Failed to load progress");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const withAttempts = progress.filter((p) => p.attemptsCount > 0);
  const sorted = [...withAttempts].sort((a, b) => b.attemptsCount - a.attemptsCount);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Student Progress</h2>
        <p className="mt-1 text-sm text-slate-500">
          Track learning progress and quiz completion
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <Users className="size-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Students
              </p>
              <p className="text-2xl font-bold text-slate-900">{loading ? "—" : progress.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <BarChart3 className="size-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                With attempts
              </p>
              <p className="text-2xl font-bold text-slate-900">{loading ? "—" : withAttempts.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <LineChart className="size-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total attempts
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? "—" : withAttempts.reduce((s, p) => s + p.attemptsCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">By student</h3>
          <p className="text-sm text-slate-500">Quiz attempts and average score</p>
        </div>
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Attempts</th>
                  <th className="px-6 py-3">Avg score</th>
                  <th className="px-6 py-3">Last attempt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((p) => (
                  <tr key={p.userId} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-6 py-3 text-slate-600">{p.email}</td>
                    <td className="px-6 py-3 text-slate-600">{p.attemptsCount}</td>
                    <td className="px-6 py-3 text-slate-600">{p.avgScorePercent}%</td>
                    <td className="px-6 py-3 text-slate-600">{formatDate(p.lastAttemptAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && sorted.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No quiz attempts yet. When students take assessments, their progress will appear here.
          </div>
        )}
      </section>
    </div>
  );
}
