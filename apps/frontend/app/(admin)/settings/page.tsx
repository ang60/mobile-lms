const paymentIntegrations = [
  {
    label: "M-Pesa Integration",
    description: "Safaricom Daraja API",
    status: "Active",
  },
  {
    label: "Card Payments",
    description: "Stripe Payments",
    status: "Active",
  },
];

const securityFeatures = [
  {
    label: "Screenshot protection",
    description: "Prevent screenshots on mobile apps.",
  },
  {
    label: "Dynamic watermarking",
    description: "User-specific watermark overlays on PDF content.",
  },
  {
    label: "PDF encryption",
    description: "AES encryption with rotating keys per license.",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header className="max-w-2xl space-y-3">
        <h2 className="text-3xl font-bold text-slate-900">
          Platform Configuration
        </h2>
        <p className="text-base font-medium text-slate-600">
          Update your academy profile, payment preferences, and DRM controls in
          one place. Changes propagate instantly across the CPA mobile apps.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Platform settings
          </h3>
          <form className="mt-6 space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                Platform name
              </span>
              <input
                defaultValue="CPA Excellence"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                Support email
              </span>
              <input
                defaultValue="support@cpa.com"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                Subscription price (KES)
              </span>
              <input
                type="number"
                defaultValue={5499}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <button className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              Save platform settings
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              Payment integrations
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-slate-600">
              {paymentIntegrations.map((integration) => (
                <li
                  key={integration.label}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 shadow-inner"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {integration.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {integration.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {integration.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              Security & DRM
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              {securityFeatures.map((feature) => (
                <li
                  key={feature.label}
                  className="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {feature.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {feature.description}
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      defaultChecked={feature.label !== "PDF encryption"}
                      className="peer sr-only"
                    />
                    <span className="h-5 w-10 rounded-full bg-slate-200 transition peer-checked:bg-blue-500" />
                    <span className="absolute left-1 top-1 size-3 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
