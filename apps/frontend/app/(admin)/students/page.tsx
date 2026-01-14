const students = [
  {
    name: "John Kamau",
    email: "john.k@email.com",
    cohort: "CPA Section 3",
    status: "Active",
    plan: "Premium",
    renewal: "Dec 05, 2024",
  },
  {
    name: "Mary Wanjiru",
    email: "mary.w@email.com",
    cohort: "CPA Section 1",
    status: "Active",
    plan: "Starter",
    renewal: "Nov 28, 2024",
  },
  {
    name: "Peter Ochieng",
    email: "peter.o@email.com",
    cohort: "CPA Section 2",
    status: "Trial",
    plan: "Trial",
    renewal: "Nov 16, 2024",
  },
  {
    name: "Sarah Akinyi",
    email: "sarah.a@email.com",
    cohort: "CPA Section 4",
    status: "Active",
    plan: "Premium",
    renewal: "Jan 03, 2025",
  },
  {
    name: "Grace Adhiambo",
    email: "grace.a@email.com",
    cohort: "CPA Section 5",
    status: "Expired",
    plan: "Premium",
    renewal: "Nov 02, 2024",
  },
];

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Student Intelligence
          </h2>
          <p className="mt-2 max-w-2xl text-base font-medium text-slate-600">
            Understand how learners are progressing across cohorts, manage
            subscription lifecycles, and identify the right interventions for
            each segment.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50">
            Export roster
          </button>
          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            Invite new student
          </button>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-4 border-b border-slate-200 px-6 py-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
              Enrollment
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">5,874</p>
            <p className="text-xs text-slate-500">+362 vs last month</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
              Engagement index
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">82%</p>
            <p className="text-xs text-slate-500">Active learners weekly</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
              Renewal window
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">317</p>
            <p className="text-xs text-slate-500">Expiring in next 30 days</p>
          </div>
        </div>

        <div className="overflow-x-auto px-6 pb-6 pt-2">
          <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                <th className="px-4 py-2">Student</th>
                <th className="px-4 py-2">Cohort</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Renewal</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {students.map((student) => (
                <tr
                  key={student.email}
                  className="rounded-xl bg-slate-50 text-sm shadow-sm transition hover:bg-slate-100"
                >
                  <td className="rounded-l-xl px-4 py-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{student.cohort}</td>
                  <td className="px-4 py-3 text-slate-500">{student.plan}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        student.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : student.status === "Trial"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{student.renewal}</td>
                  <td className="rounded-r-xl px-4 py-3 text-right">
                    <button className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                      View profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
