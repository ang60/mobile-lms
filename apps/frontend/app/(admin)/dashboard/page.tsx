import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CreditCard,
  GraduationCap,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Zap,
  LineChart,
} from "lucide-react";

const metricCards = [
  {
    label: "Total Students",
    value: "5,874",
    caption: "+362 this month",
    change: "+6.6%",
    icon: GraduationCap,
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    bgGradient: "from-indigo-50 via-purple-50 to-pink-50",
    iconBg: "from-indigo-100 to-purple-100",
  },
  {
    label: "Active Subscriptions",
    value: "3,942",
    caption: "76% conversion rate",
    change: "+12.3%",
    icon: Users,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    bgGradient: "from-emerald-50 via-teal-50 to-cyan-50",
    iconBg: "from-emerald-100 to-teal-100",
  },
  {
    label: "Monthly Revenue",
    value: "KES 22.8M",
    caption: "Nov 2024",
    change: "+18.2%",
    icon: CreditCard,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    bgGradient: "from-violet-50 via-purple-50 to-fuchsia-50",
    iconBg: "from-violet-100 to-purple-100",
  },
  {
    label: "Avg. Study Time / Day",
    value: "4.6h",
    caption: "Across all cohorts",
    change: "+8.4%",
    icon: Activity,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    bgGradient: "from-amber-50 via-orange-50 to-red-50",
    iconBg: "from-amber-100 to-orange-100",
  },
];

const revenueTrend = [
  { label: "Mon", value: 32, height: "32%" },
  { label: "Tue", value: 45, height: "45%" },
  { label: "Wed", value: 38, height: "38%" },
  { label: "Thu", value: 52, height: "52%" },
  { label: "Fri", value: 47, height: "47%" },
  { label: "Sat", value: 58, height: "58%" },
  { label: "Sun", value: 61, height: "61%" },
];

const upcomingModules = [
  {
    title: "Taxation for SMEs",
    date: "Nov 18",
    cohort: "CPA Section 5",
    status: "upcoming",
    students: 342,
  },
  {
    title: "Auditing Masterclass",
    date: "Nov 22",
    cohort: "CPA Section 4",
    status: "upcoming",
    students: 289,
  },
  {
    title: "Financial Reporting Cases",
    date: "Nov 28",
    cohort: "CPA Section 6",
    status: "upcoming",
    students: 456,
  },
];

const recentStudents = [
  { name: "John Kamau", email: "john.k@mail.com", status: "Active", joined: "2 days ago" },
  { name: "Mary Wanjiru", email: "mary.w@mail.com", status: "Active", joined: "3 days ago" },
  { name: "Peter Ochieng", email: "peter.o@mail.com", status: "Trial", joined: "1 day ago" },
  { name: "Sarah Akinyi", email: "sarah.a@mail.com", status: "Active", joined: "5 days ago" },
  { name: "David Mutua", email: "david.m@mail.com", status: "Expired", joined: "1 week ago" },
];

const strategicPriorities = [
  {
    title: "Launch CPA Elite onboarding campaign",
    description: "December intake preparation",
    priority: "high",
    icon: Zap,
    color: "indigo",
  },
  {
    title: "Optimize subscription checkout",
    description: "Reduce drop-off at payment step",
    priority: "medium",
    icon: TrendingUp,
    color: "emerald",
  },
  {
    title: "Expand Power BI analytics",
    description: "Include content completion heatmaps",
    priority: "medium",
    icon: Activity,
    color: "violet",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Performance Snapshot
          </h2>
          <p className="max-w-2xl text-base font-medium text-slate-600 leading-relaxed">
            Monitor the pulse of your CPA learning business in real-time. Track
            student engagement, subscription growth, and revenue momentum from a
            single command center.
          </p>
        </div>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700">
          Download executive report
          <ArrowUpRight className="size-4" />
        </button>
      </section>

      {/* Metric Cards Grid */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <div
            key={metric.label}
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-30 blur-3xl -z-10`}
            />
            
            {/* Icon */}
            <div className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${metric.iconBg} shadow-sm`}>
              <metric.icon className={`size-6 bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`} />
            </div>

            {/* Content */}
            <div className="mt-6 space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                {metric.label}
              </p>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  <TrendingUp className="size-3" />
                  {metric.change}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-600">{metric.caption}</p>
            </div>

            {/* Decorative element */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${metric.gradient} opacity-10 blur-2xl`} />
          </div>
        ))}
      </section>

      {/* Charts and Modules Section */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Overview */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Last 7 days performance</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
              <TrendingUp className="size-4" />
              +18% vs last week
            </span>
          </div>
          
          <div className="flex h-64 items-end gap-4">
            {revenueTrend.map((day) => (
              <div key={day.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="relative w-full group">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/30"
                    style={{ height: day.height }}
                  >
                    <div className="absolute inset-0 rounded-t-xl bg-gradient-to-t from-blue-700/50 to-transparent" />
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                    KES {day.value}K
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Modules */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Upcoming Modules</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Scheduled releases</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50">
              <BookOpen className="size-5 text-blue-600" />
            </div>
          </div>
          
          <ul className="space-y-4">
            {upcomingModules.map((module) => (
              <li
                key={module.title}
                className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-blue-300 hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
                    <Calendar className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900 mb-1">{module.title}</h4>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600 mb-2">
                          {module.cohort}
                        </p>
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {module.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="size-3.5" />
                            {module.students} enrolled
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recent Activity and Priorities */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Recent Students */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Student Activity</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Latest registrations</p>
            </div>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
              View all →
            </button>
          </div>
          
          <div className="divide-y divide-slate-200">
            {recentStudents.map((student) => (
              <div
                key={student.email}
                className="flex items-center justify-between py-4 transition-colors hover:bg-slate-50 rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm shadow-sm">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{student.name}</p>
                    <p className="text-xs font-medium text-slate-500 truncate">{student.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{student.joined}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ${
                    student.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : student.status === "Trial"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {student.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Priorities */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Strategic Priorities</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Action items</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50">
              <LineChart className="size-5 text-blue-600" />
            </div>
          </div>
          
          <ul className="space-y-4">
            {strategicPriorities.map((priority, index) => {
              const Icon = priority.icon;
              const colorClasses = {
                indigo: "from-indigo-50 to-indigo-100/50 border-indigo-200/50 text-indigo-900",
                emerald: "from-emerald-50 to-emerald-100/50 border-emerald-200/50 text-emerald-900",
                violet: "from-violet-50 to-violet-100/50 border-violet-200/50 text-violet-900",
              };
              
              return (
                <li
                  key={index}
                  className={`rounded-xl border bg-gradient-to-br ${colorClasses[priority.color as keyof typeof colorClasses]} p-4 shadow-sm transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                      priority.color === "indigo" ? "from-indigo-500 to-indigo-600" :
                      priority.color === "emerald" ? "from-emerald-500 to-emerald-600" :
                      "from-violet-500 to-violet-600"
                    } text-white shadow-sm`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold mb-1">{priority.title}</h4>
                      <p className="text-xs font-medium opacity-70">{priority.description}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
