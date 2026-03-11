"use client";

import { contentApi } from "@/lib/api/content";
import { coursesApi, type CourseWithSections, type SectionItem } from "@/lib/api/courses";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [course, setCourse] = useState<CourseWithSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [contentCountBySection, setContentCountBySection] = useState<Record<string, number>>({});

  const loadCourse = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await coursesApi.get(id);
      setCourse(data);
    } catch (e) {
      toast.error("Failed to load course");
      console.error(e);
      router.push("/courses");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  useEffect(() => {
    if (!course?.sections?.length) return;
    const loadCounts = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        course.sections.map(async (sec) => {
          const list = await contentApi.list({ sectionId: sec.id });
          counts[sec.id] = list.length;
        }),
      );
      setContentCountBySection(counts);
    };
    loadCounts();
  }, [course?.sections]);

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newSectionName.trim();
    if (!name) {
      toast.error("Enter a section name");
      return;
    }
    if (!id) return;
    try {
      setAddingSection(true);
      await coursesApi.addSection(id, name);
      toast.success(`Section "${name}" added`);
      setNewSectionName("");
      setSectionModalOpen(false);
      loadCourse();
    } catch (e) {
      toast.error("Failed to add section");
      console.error(e);
    } finally {
      setAddingSection(false);
    }
  };

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        {loading ? "Loading…" : "Course not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/courses"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Back to courses"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{course.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add sections and upload content for each section.
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => setSectionModalOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700"
        >
          <Plus className="size-4" />
          Add Section
        </Button>
      </header>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Sections</h3>
        {!course.sections?.length ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            No sections yet. Click &quot;Add Section&quot; to add one (e.g. CPA 1, CPA 2).
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {course.sections.map((sec) => (
              <SectionCard
                key={sec.id}
                section={sec}
                courseId={id}
                courseName={course.name}
                contentCount={contentCountBySection[sec.id] ?? 0}
              />
            ))}
          </ul>
        )}
      </section>

      <Dialog open={sectionModalOpen} onOpenChange={setSectionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>
              Add a section to this course (e.g. CPA 1, CPA 2, Section A).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSection} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section-name">Section name</Label>
              <Input
                id="section-name"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="e.g. CPA 1"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSectionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addingSection}>
                {addingSection ? "Adding…" : "Add Section"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionCard({
  section,
  courseId,
  courseName,
  contentCount,
}: {
  section: SectionItem;
  courseId: string;
  courseName: string;
  contentCount: number;
}) {
  const uploadUrl = `/upload-new?courseId=${encodeURIComponent(courseId)}&sectionId=${encodeURIComponent(section.id)}&courseName=${encodeURIComponent(courseName)}&sectionName=${encodeURIComponent(section.name)}`;

  return (
    <li className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
          {section.name.slice(0, 2)}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{section.name}</p>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <FileText className="size-3.5" />
            {contentCount} {contentCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>
      <Link
        href={uploadUrl}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Upload className="size-4" />
        Upload content
      </Link>
    </li>
  );
}
