"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpen,
  GraduationCap,
  Settings,
  TrendingUp,
  Globe,
  User,
  Zap,
  Rocket,
  Calendar,
  MessageSquare,
  Target,
  Star,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  dashboard: Globe,
  profile: User,
  matching: Zap,
  programs: Rocket,
  sessions: Calendar,
  communication: MessageSquare,
  goals: Target,
  feedback: Star,
  gamification: Trophy,
  reports: BarChart3,
  admin: Settings,
  content: BookOpen,
  students: GraduationCap,
  revenue: TrendingUp,
  analytics: Activity,
  settings: Settings,
};

const sidebarSections = [
  {
    title: "MAIN",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "dashboard" as const },
      { href: "/profile", label: "Profile", icon: "profile" as const },
    ],
  },
  {
    title: "CORE FEATURES",
    items: [
      { href: "/content", label: "Content", icon: "content" as const },
      { href: "/students", label: "Students", icon: "students" as const },
      { href: "/revenue", label: "Revenue", icon: "revenue" as const },
      { href: "/analytics", label: "Analytics", icon: "analytics" as const },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { href: "/reports", label: "Reports", icon: "reports" as const },
      { href: "/settings", label: "Settings", icon: "settings" as const },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-[73px] w-64 shrink-0 bg-blue-50 text-slate-700 h-[calc(100vh-73px)] overflow-y-auto z-10 border-r border-blue-100">
      <nav className="p-4 space-y-6">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = iconMap[item.icon];
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-blue-100"
                    )}
                  >
                    <Icon className="size-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      {/* Notification and Collapse at bottom */}
      <div className="px-4 pb-4 space-y-2">
        {/* <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full text-center">
          N 1 Issue X
        </div> */}
        <button className="text-xs text-slate-500 hover:text-slate-700 w-full text-left px-3">
          Collapse
        </button>
      </div>
    </aside>
  );
}

