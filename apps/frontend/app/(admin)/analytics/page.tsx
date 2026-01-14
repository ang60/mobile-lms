import { BarChart3, Brain, Database, TimerReset } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <h2 className="text-3xl font-bold text-slate-900">
          Analytics & Insights
        </h2>
        <p className="max-w-2xl text-base font-medium text-slate-600">
          Connect your favourite BI tools, automate KPI delivery, and monitor
          engagement cycles alongside revenue metrics. Built for data-driven
          academic teams.
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100">
              <BarChart3 className="size-3.5" />
              Power BI integration
            </span>
            <h3 className="text-3xl font-bold leading-tight text-white">
              Two-way sync your CPA data warehouse with Power BI in minutes.
            </h3>
            <p className="text-blue-100/80">
              Stream cohort activity, subscription revenue, and content
              completion metrics into your BI dashboards. Keep finance, product,
              and academics aligned with a single source of truth.
            </p>
            <div className="flex gap-3 pt-2">
              <button className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-blue-600 shadow-sm transition hover:bg-slate-100">
                Open Power BI connector
              </button>
              <button className="inline-flex h-11 items-center justify-center rounded-xl border border-white/40 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
                View API docs
              </button>
            </div>
          </div>
          <div className="grid gap-5 rounded-xl bg-white/10 p-6 text-sm font-medium text-white backdrop-blur-md md:grid-cols-2">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-100/80">
                Sync status
              </p>
              <p className="mt-2 text-lg font-bold text-white">Active</p>
              <p className="text-xs text-blue-100/70">Updated 2 hours ago</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-100/80">
                Dataset size
              </p>
              <p className="mt-2 text-lg font-bold text-white">3.2M rows</p>
              <p className="text-xs text-blue-100/70">9 connected sources</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-100/80">
                Report latency
              </p>
              <p className="mt-2 text-lg font-bold text-white">15 min</p>
              <p className="text-xs text-blue-100/70">Refresh cycle</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-100/80">
                Forecast accuracy
              </p>
              <p className="mt-2 text-lg font-bold text-white">92%</p>
              <p className="text-xs text-blue-100/70">Next-quarter revenue</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Database className="size-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Data orchestration
            </h3>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Forward curated datasets into Snowflake or BigQuery, complete with
            cohort, device, and payment segmentation.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <TimerReset className="size-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Real-time triggers
            </h3>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Automate outreach when students fall behind in revision or when a
            high-value customer subscription is about to lapse.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Brain className="size-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Predictive insights
            </h3>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Surface churn risk and cross-sell opportunities using success scores
            derived from engagement patterns.
          </p>
        </div>
      </section>
    </div>
  );
}
