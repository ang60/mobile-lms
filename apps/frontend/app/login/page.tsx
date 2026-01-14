"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api-client";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@mobilelms.com");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiClient.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }

      toast.success("Logged in successfully");
      router.replace("/dashboard");
    } catch (err) {
      let message = "Failed to sign in. Please check your credentials.";
      if (err instanceof ApiError) {
        message = err.message;
      }
      toast.error(message);
      console.error("[LoginPage] Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/60">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
            CPA Admin
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-50">
            Sign in to dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Use your admin credentials to manage content and students.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-3 text-sm text-slate-50 placeholder:text-slate-500 focus-visible:ring-blue-500"
                placeholder="admin@mobilelms.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-3 text-sm text-slate-50 placeholder:text-slate-500 focus-visible:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="mt-2 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-500/30 hover:bg-blue-500"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <p className="mt-2 text-center text-xs text-slate-500">
            Demo credentials: <span className="font-mono">admin@mobilelms.com</span>{" "}
            / <span className="font-mono">Admin@123</span>
          </p>
        </form>
      </div>
    </div>
  );
}


