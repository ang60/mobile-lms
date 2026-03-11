"use client";

import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.replace("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex h-[73px] items-center justify-between border-b border-slate-200 bg-slate-900 px-6 text-white">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-slate-700 font-bold text-sm">
          D
        </div>
        <span className="font-semibold">Digital Learning Platform</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-300">Welcome back, Admin</span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex size-10 items-center justify-center rounded-full bg-slate-600 text-sm font-bold text-white transition-colors hover:bg-slate-500"
          title="Sign out"
        >
          A
        </button>
      </div>
    </header>
  );
}
