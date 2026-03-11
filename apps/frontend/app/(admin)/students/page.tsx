"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, CreditCard, Tag, Ban, Search, Filter, LayoutGrid, Plus } from "lucide-react";
import { usersApi, type UserItem } from "@/lib/api/users";
import { toast } from "sonner";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatJoined(createdAt: string) {
  try {
    const d = new Date(createdAt);
    return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.list();
      setUsers(data);
    } catch (e) {
      toast.error("Failed to load users");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const summary = useMemo(() => {
    const total = users.length;
    const pro = users.filter((u) => u.subscription?.status === "active").length;
    const free = total - pro;
    return [
      { label: "Total Users", value: total.toLocaleString(), caption: "All time registrations", icon: Users },
      { label: "Pro/Paid", value: pro.toLocaleString(), caption: total ? `${Math.round((pro / total) * 100)}% conversion` : "—", icon: CreditCard },
      { label: "Free Tier", value: free.toLocaleString(), caption: total ? `${Math.round((free / total) * 100)}% of total` : "—", icon: Tag },
      { label: "Admins", value: users.filter((u) => u.role === "admin").length.toString(), caption: "Platform admins", icon: Ban },
    ];
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Monitor accounts, subscriptions and access
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          onClick={() => toast.info("Invite user coming soon")}
        >
          <Plus className="size-4" />
          Invite User
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {c.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{c.value}</p>
                <p className="mt-1 text-sm text-slate-600">{c.caption}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-2">
                <c.icon className="size-5 text-slate-600" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="search"
              placeholder="Filter by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Filter className="size-4" />
              Status
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Loading users...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                            {getInitials(u.name)}
                          </div>
                          <span className="font-medium text-slate-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-600">{u.email}</td>
                      <td className="px-6 py-3 text-slate-600">
                        {u.subscription?.status === "active" ? "Pro" : "Free"}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            u.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">{formatJoined(u.createdAt)}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          onClick={() => toast.info("Manage user coming soon")}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-sm text-slate-500">
              <span>
                Showing {filtered.length} of {users.length} users
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
