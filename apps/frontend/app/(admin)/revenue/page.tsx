const revenueSummary = [
  {
    label: "Total Revenue",
    value: "KES 22.8M",
    change: "+18% from last month",
    accent: "bg-gradient-to-r from-blue-500 to-blue-400",
  },
  {
    label: "Revenue this month",
    value: "KES 8.2M",
    change: "November 2024",
    accent: "bg-gradient-to-r from-indigo-500 to-indigo-400",
  },
  {
    label: "Average per student",
    value: "KES 5,499",
    change: "Per term",
    accent: "bg-gradient-to-r from-emerald-500 to-emerald-400",
  },
];

const paymentTable = [
  {
    name: "John Kamau",
    amount: "KES 5,499",
    method: "M-Pesa",
    date: "2024-11-05",
    status: "Completed",
  },
  {
    name: "Mary Wanjiru",
    amount: "KES 5,499",
    method: "Card",
    date: "2024-11-05",
    status: "Completed",
  },
  {
    name: "Alice Njeri",
    amount: "KES 5,499",
    method: "M-Pesa",
    date: "2024-11-04",
    status: "Completed",
  },
  {
    name: "James Mwangi",
    amount: "KES 5,499",
    method: "M-Pesa",
    date: "2024-11-04",
    status: "Pending",
  },
  {
    name: "Grace Adhiambo",
    amount: "KES 5,499",
    method: "Card",
    date: "2024-11-03",
    status: "Completed",
  },
];

export default function RevenuePage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Revenue Intelligence
          </h2>
          <p className="mt-2 max-w-2xl text-base font-medium text-slate-600">
            Track subscription inflows, identify high-value channels, and export
            finance-ready statements for your accounting workflow.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50">
            Export to Excel
          </button>
          <button className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100">
            Connect Power BI
          </button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {revenueSummary.map((card) => (
          <div
            key={card.label}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div
              className={`h-2 w-full rounded-full ${card.accent} opacity-70`}
            />
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
              {card.label}
            </h3>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-sm text-slate-500">{card.change}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">
            Recent payments
          </h3>
          <p className="text-sm text-slate-500">
            All transactions processed in the last 7 days.
          </p>
        </div>
        <div className="overflow-x-auto px-6 pb-6">
          <table className="w-full min-w-[540px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                <th className="px-4 py-2">Student</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Method</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {paymentTable.map((payment) => (
                <tr
                  key={`${payment.name}-${payment.date}`}
                  className="rounded-xl bg-slate-50 text-sm shadow-sm transition hover:bg-slate-100"
                >
                  <td className="rounded-l-xl px-4 py-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        {payment.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{payment.amount}</td>
                  <td className="px-4 py-3 text-slate-500">{payment.method}</td>
                  <td className="px-4 py-3 text-slate-500">{payment.date}</td>
                  <td className="rounded-r-xl px-4 py-3 text-right">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        payment.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
