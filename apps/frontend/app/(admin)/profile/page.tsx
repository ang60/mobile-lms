import { User, Mail, Phone, MapPin, Calendar, Shield, Key } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Profile Settings</h2>
        <p className="mt-2 text-base font-medium text-slate-600">
          Manage your account information, security settings, and preferences.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Personal Information</h3>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                    First Name
                  </span>
                  <input
                    type="text"
                    defaultValue="Admin"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                    Last Name
                  </span>
                  <input
                    type="text"
                    defaultValue="User"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                  Email Address
                </span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="email"
                    defaultValue="admin@cpa.com"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                  Phone Number
                </span>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="tel"
                    defaultValue="+254 700 000 000"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                  Location
                </span>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    defaultValue="Nairobi, Kenya"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </label>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Save Changes
              </button>
            </form>
          </div>

          {/* Security Settings */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="size-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Security Settings</h3>
            </div>
            <form className="space-y-4">
              <label className="block space-y-1">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                  Current Password
                </span>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                  New Password
                </span>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                  Confirm New Password
                </span>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </label>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative size-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                <span>AU</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Admin User</h3>
              <p className="text-sm text-slate-500 mt-1">admin@cpa.com</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-blue-700 border border-blue-200 mt-3">
                <Shield className="size-3.5" />
                Super Admin
              </span>
            </div>
          </div>

          {/* Account Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Account Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Member since</span>
                </div>
                <span className="text-sm font-bold text-slate-900">Jan 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Role</span>
                </div>
                <span className="text-sm font-bold text-slate-900">Administrator</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Status</span>
                </div>
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

