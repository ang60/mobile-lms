"use client";

import { coursesApi, type CourseItem } from "@/lib/api/courses";
import { Plus, ChevronRight, FolderOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesApi.list();
      setCourses(data);
    } catch (e) {
      toast.error("Failed to load courses");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      toast.error("Enter a course name");
      return;
    }
    try {
      setAdding(true);
      await coursesApi.createCourse(name);
      toast.success(`Course "${name}" created`);
      setNewName("");
      loadCourses();
    } catch (e) {
      toast.error("Failed to create course");
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Courses</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage courses. Click a course to add sections and upload content.
          </p>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleAddCourse} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New course name (e.g. CPA)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            <Plus className="size-4" />
            Add Course
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading courses…</div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <FolderOpen className="mx-auto size-12 text-slate-300" />
          <p className="mt-4">No courses yet. Add a course above.</p>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group relative flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-600">
                  {course.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{course.name}</h3>
                  <p className="text-sm text-slate-500">Edit · Add sections · Upload content</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-400 group-hover:text-slate-600" />
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
