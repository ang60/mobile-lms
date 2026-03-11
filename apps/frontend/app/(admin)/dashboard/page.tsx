"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  CreditCard,
  TrendingUp,
  Users,
  CheckCircle2,
  UserPlus,
  Wallet,
  AlertTriangle,
  Lock,
  Flame,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { contentApi, type ContentItem } from "@/lib/api/content";
import { usersApi, type UserItem } from "@/lib/api/users";
import { toast } from "sonner";

const recentActivity = [
  { text: "New material published", icon: CheckCircle2 },
  { text: "New user registered", icon: UserPlus },
  { text: "Purchase completed", icon: Wallet },
  { text: "Device limit reached", icon: AlertTriangle },
  { text: "Security alert", icon: Lock },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DashboardPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [revenueMonth, setRevenueMonth] = useState<number | null>(null);
  const [revenueTotal, setRevenueTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [contentData, usersData, revenueData] = await Promise.all([
          contentApi.list(),
          usersApi.list(),
          adminApi.getRevenue().catch(() => ({ total: 0, count: 0, monthTotal: 0 })),
        ]);
        if (!cancelled) {
          setContent(contentData);
          setUsers(usersData);
          setRevenueMonth(revenueData.monthTotal);
          setRevenueTotal(revenueData.total);
        }
      } catch (e) {
        if (!cancelled) toast.error("Failed to load dashboard data");
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const metricCards = useMemo(() => {
    const totalContent = content.length;
    const totalUsers = users.length;
    const proUsers = users.filter((u) => u.subscription?.status === "active").length;
    return [
      {
        label: "Total Materials",
        value: loading ? "—" : totalContent.toLocaleString(),
        caption: "Published content",
        icon: BookOpen,
      },
      {
        label: "Registered Users",
        value: loading ? "—" : totalUsers.toLocaleString(),
        caption: totalUsers ? `${proUsers} Pro · ${totalUsers - proUsers} Free` : "—",
        icon: Users,
      },
      {
        label: "Revenue MTD",
        value: loading ? "—" : (revenueMonth != null ? `KES ${revenueMonth.toLocaleString()}` : "—"),
        caption: revenueTotal != null ? `Total: KES ${revenueTotal.toLocaleString()}` : "From subscriptions",
        icon: CreditCard,
      },
      {
        label: "Active Today",
        value: loading ? "—" : totalUsers.toLocaleString(),
        caption: "Total registered users",
        icon: Activity,
      },
    ];
  }, [content.length, users, loading, revenueMonth, revenueTotal]);

  const latestContent = useMemo(() => {
    const sorted = [...content].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
    return sorted.slice(0, 5).map((c, i) => ({
      rank: i + 1,
      title: c.title,
      course: c.subject,
      section: "—",
    }));
  }, [content]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {m.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{m.value}</p>
                <p className="mt-1 text-sm text-slate-600">{m.caption}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-2">
                <m.icon className="size-5 text-slate-600" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-slate-400" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue Trend</h3>
              <p className="text-sm text-slate-500">Monthly revenue (connect payments for data)</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
              <TrendingUp className="size-4" />
              —
            </span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-2">
            {months.map((month, i) => (
              <div
                key={month}
                className="flex-1 rounded-t bg-slate-200 transition-colors hover:bg-slate-300"
                style={{ height: `${30 + (i % 5) * 12}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs font-medium text-slate-500">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          <p className="text-sm text-slate-500">Latest platform events</p>
          <ul className="mt-4 space-y-3">
            {recentActivity.map((item) => (
              <li
                key={item.text}
                className="flex items-center gap-3 text-sm text-slate-700"
              >
                <item.icon className="size-4 shrink-0 text-slate-500" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Flame className="size-5 text-slate-600" />
              Latest Content
            </h3>
            <p className="text-sm text-slate-500">Most recently added materials</p>
          </div>
          <button type="button" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Course</th>
                <th className="px-6 py-3">Section</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {latestContent.map((row) => (
                <tr key={row.rank} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-500">{String(row.rank).padStart(2, "0")}</td>
                  <td className="px-6 py-3 font-medium text-slate-900">{row.title}</td>
                  <td className="px-6 py-3 text-slate-600">{row.course}</td>
                  <td className="px-6 py-3 text-slate-600">{row.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {latestContent.length === 0 && !loading && (
          <div className="px-6 py-8 text-center text-sm text-slate-500">No content yet. Upload materials from Content or Upload New.</div>
        )}
      </section>
    </div>
  );
}
