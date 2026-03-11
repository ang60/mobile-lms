"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  Upload,
  ClipboardList,
  TrendingUp,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarSections = [
  {
    title: "Dashboard",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "CONTENT MANAGEMENT",
    items: [
      { href: "/content", label: "All Materials", icon: BookOpen },
      { href: "/courses", label: "Courses", icon: FolderOpen },
      { href: "/upload-new", label: "Upload New", icon: Upload },
    ],
  },
  {
    title: "LEARNING",
    items: [
      { href: "/assessments", label: "Assessments", icon: ClipboardList },
      { href: "/student-progress", label: "Student Progress", icon: TrendingUp },
    ],
  },
  {
    title: "PLATFORM",
    items: [
      { href: "/students", label: "Users", icon: Users },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-[73px] w-64 shrink-0 border-r border-slate-200 bg-slate-900 text-slate-300 h-[calc(100vh-73px)] overflow-y-auto z-10">
      <div className="p-4">
        <nav className="space-y-6">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
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
                          ? "bg-slate-700 text-white"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      )}
                    >
                      <item.icon className="size-5 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {"badge" in item && item.badge !== undefined && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                          {String(item.badge)}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
