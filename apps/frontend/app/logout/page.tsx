"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    window.location.href = "/auth/logout";
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-700">
      <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-lg">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
          Signing out
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Redirecting to login...
        </h1>
      </div>
    </div>
  );
}


