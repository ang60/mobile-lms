import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react";

const reportTypes = [
  {
    title: "Student Enrollment Report",
    description: "Comprehensive overview of student registrations, cohorts, and enrollment trends",
    icon: Users,
    lastGenerated: "Nov 15, 2024",
    format: "PDF, Excel",
  },
  {
    title: "Revenue Analytics Report",
    description: "Detailed breakdown of subscription revenue, payment methods, and financial trends",
    icon: DollarSign,
    lastGenerated: "Nov 15, 2024",
    format: "PDF, Excel",
  },
  {
    title: "Content Engagement Report",
    description: "Analysis of content consumption, completion rates, and student progress",
    icon: FileText,
    lastGenerated: "Nov 14, 2024",
    format: "PDF, Excel",
  },
  {
    title: "Performance Dashboard",
    description: "Key performance indicators and metrics across all platform activities",
    icon: BarChart3,
    lastGenerated: "Nov 15, 2024",
    format: "PDF, Excel",
  },
];

const recentReports = [
  {
    name: "Monthly Revenue Report - November 2024",
    type: "Revenue Analytics",
    generated: "2 hours ago",
    size: "2.4 MB",
  },
  {
    name: "Student Enrollment Summary - Q4 2024",
    type: "Student Enrollment",
    generated: "1 day ago",
    size: "1.8 MB",
  },
  {
    name: "Content Performance Analysis",
    type: "Content Engagement",
    generated: "3 days ago",
    size: "3.2 MB",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Reports & Analytics</h2>
          <p className="mt-2 max-w-2xl text-base font-medium text-slate-600">
            Generate comprehensive reports on student enrollment, revenue, content engagement, and platform performance.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
            <Calendar className="size-4" />
            Schedule Report
          </button>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
            <Download className="size-4" />
            Export All
          </button>
        </div>
      </header>

      {/* Report Types */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Available Reports</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="size-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-slate-900 mb-2">{report.title}</h4>
                    <p className="text-sm text-slate-500 mb-4">{report.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-400">
                        <span className="font-medium">Last generated:</span> {report.lastGenerated}
                      </div>
                      <div className="text-xs text-slate-400">
                        <span className="font-medium">Format:</span> {report.format}
                      </div>
                    </div>
                    <button className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 w-full">
                      <Download className="size-4" />
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Reports */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Recent Reports</h3>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            View all →
          </button>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-200">
            {recentReports.map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{report.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">{report.type}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{report.generated}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{report.size}</span>
                    </div>
                  </div>
                </div>
                <button className="ml-4 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  <Download className="size-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                Total Reports
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">47</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">Generated this month</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                Scheduled
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">Automated reports</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Download className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                Downloads
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">234</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">This month</p>
        </div>
      </section>
    </div>
  );
}

