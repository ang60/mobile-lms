"use client";

import { adminApi, type PaymentItem, type RevenueSummary } from "@/lib/api/admin";
import { usersApi, type UserItem } from "@/lib/api/users";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString()}`;
}

export default function RevenuePage() {
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [rev, pay, usr] = await Promise.all([
        adminApi.getRevenue(),
        adminApi.getPayments(100),
        usersApi.list(),
      ]);
      setRevenue(rev);
      setPayments(pay);
      setUsers(usr);
    } catch (e) {
      toast.error("Failed to load revenue data");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const userMap = useMemo(() => {
    const m = new Map<string, UserItem>();
    users.forEach((u) => m.set(u.id, u));
    return m;
  }, [users]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Revenue</h2>
          <p className="mt-2 max-w-2xl text-base font-medium text-slate-600">
            Subscription revenue from plan activations. Data updates when users subscribe.
          </p>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 opacity-70" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Total revenue</h3>
          <p className="text-2xl font-bold text-slate-900">
            {loading ? "—" : formatAmount(revenue?.total ?? 0, "KES")}
          </p>
          <p className="text-sm text-slate-500">{revenue?.count ?? 0} payments</p>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-70" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">This month</h3>
          <p className="text-2xl font-bold text-slate-900">
            {loading ? "—" : formatAmount(revenue?.monthTotal ?? 0, "KES")}
          </p>
          <p className="text-sm text-slate-500">MTD</p>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-70" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg per payment</h3>
          <p className="text-2xl font-bold text-slate-900">
            {loading || !revenue?.count
              ? "—"
              : formatAmount(Math.round(revenue.total / revenue.count), "KES")}
          </p>
          <p className="text-sm text-slate-500">All time</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Recent payments</h3>
          <p className="text-sm text-slate-500">Subscription activations (most recent first)</p>
        </div>
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto px-6 pb-6">
            <table className="w-full min-w-[540px] border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Plan</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {payments.map((payment) => {
                  const user = userMap.get(payment.userId);
                  return (
                    <tr
                      key={payment.id}
                      className="rounded-xl bg-slate-50 shadow-sm transition hover:bg-slate-100"
                    >
                      <td className="rounded-l-xl px-4 py-3">
                        <p className="font-bold text-slate-900">{user?.name ?? payment.userId}</p>
                        <p className="text-xs text-slate-500">{user?.email ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatAmount(payment.amount, payment.currency)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{payment.planId ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(payment.createdAt)}</td>
                      <td className="rounded-r-xl px-4 py-3 text-right">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            payment.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && payments.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No payments yet. Revenue is recorded when users activate a subscription plan.
          </div>
        )}
      </section>
    </div>
  );
}
