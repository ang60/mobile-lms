"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { coursesApi, type CourseItem, type CourseWithSections } from "@/lib/api/courses";
import { contentApi } from "@/lib/api/content";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithSections | null>(null);
  const [content, setContent] = useState<{ sectionId?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [coursesData, contentData] = await Promise.all([
          coursesApi.list(),
          contentApi.list(),
        ]);
        if (!cancelled) {
          setCourses(coursesData);
          setContent(contentData);
          if (coursesData.length > 0) {
            const full = await coursesApi.get(coursesData[0].id);
            if (!cancelled) setSelectedCourse(full);
          }
        }
      } catch (e) {
        if (!cancelled) toast.error("Failed to load courses and content");
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const sectionsWithCount = useMemo(() => {
    if (!selectedCourse?.sections) return [];
    return selectedCourse.sections.map((sec) => ({
      ...sec,
      materials: content.filter((c) => c.sectionId === sec.id).length,
    }));
  }, [selectedCourse, content]);

  const maxMaterials = Math.max(1, ...sectionsWithCount.map((s) => s.materials));

  if (loading) {
    return (
      <div className="space-y-6">
        <header>
          <h2 className="text-2xl font-bold text-slate-900">Sections</h2>
          <p className="mt-1 text-sm text-slate-500">Loading...</p>
        </header>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h2 className="text-2xl font-bold text-slate-900">Sections</h2>
          <p className="mt-1 text-sm text-slate-500">No courses yet. Create one from the Courses page.</p>
        </header>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          <Plus className="size-4" />
          Go to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sections</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sections for course: {selectedCourse?.name ?? courses[0]?.name}
          </p>
          {courses.length > 1 && (
            <select
              className="mt-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
              value={selectedCourse?.id ?? ""}
              onChange={async (e) => {
                const id = e.target.value;
                if (!id) return;
                try {
                  const full = await coursesApi.get(id);
                  setSelectedCourse(full);
                } catch {
                  toast.error("Failed to load course");
                }
              }}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Plus className="size-4" />
          Manage course / New section
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sectionsWithCount.map((sec) => (
          <div
            key={sec.id}
            className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              onClick={() => toast.info("Edit section in Courses page")}
              aria-label="Edit"
            >
              <Pencil className="size-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-600">
                {sec.order}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{selectedCourse?.name} – {sec.name}</h3>
                <p className="text-sm text-slate-500">{sec.materials} materials</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-400 transition-all"
                style={{ width: `${Math.min(100, (sec.materials / maxMaterials) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </section>
      {sectionsWithCount.length === 0 && selectedCourse && (
        <p className="text-sm text-slate-500">No sections in this course. Add sections from the <Link href="/courses" className="text-slate-700 underline">Courses</Link> page.</p>
      )}
    </div>
  );
}
