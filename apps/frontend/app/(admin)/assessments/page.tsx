"use client";

import { assessmentsApi, type AssessmentItem } from "@/lib/api/assessments";
import { coursesApi, type CourseWithSections } from "@/lib/api/courses";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Brain, Star, CheckCircle2, Plus, MoreHorizontal, Pencil } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const metricCards = [
  { label: "Total Quizzes", value: "—", caption: "All active", icon: ClipboardList },
  { label: "Total Attempts", value: "—", caption: "This week", icon: Brain },
  { label: "Avg. Score", value: "—", caption: "Across all quizzes", icon: Star },
  { label: "Pass Rate", value: "—", caption: ">60% considered passing", icon: CheckCircle2 },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuizOpen, setNewQuizOpen] = useState(false);
  const [courses, setCourses] = useState<CourseWithSections[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [formCourseId, setFormCourseId] = useState("");
  const [formSectionId, setFormSectionId] = useState("");
  const [formCourseName, setFormCourseName] = useState("");
  const [formSectionName, setFormSectionName] = useState("");
  const [formQuestions, setFormQuestions] = useState(10);
  const [formTimeMinutes, setFormTimeMinutes] = useState(15);
  const [formDifficulty, setFormDifficulty] = useState("Medium");
  const [submitting, setSubmitting] = useState(false);

  const loadAssessments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await assessmentsApi.list();
      setAssessments(data);
    } catch (e) {
      toast.error("Failed to load assessments");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  const loadCoursesForForm = useCallback(async () => {
    try {
      const list = await coursesApi.list();
      const withSections = await Promise.all(list.map((c) => coursesApi.get(c.id)));
      setCourses(withSections);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (newQuizOpen) loadCoursesForForm();
  }, [newQuizOpen, loadCoursesForForm]);

  const selectedCourse = courses.find((c) => c.id === formCourseId);
  const sections = selectedCourse?.sections ?? [];

  const resetForm = () => {
    setFormTitle("");
    setFormCourseId("");
    setFormSectionId("");
    setFormCourseName("");
    setFormSectionName("");
    setFormQuestions(10);
    setFormTimeMinutes(15);
    setFormDifficulty("Medium");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = formTitle.trim();
    if (!title) {
      toast.error("Enter a quiz title");
      return;
    }
    try {
      setSubmitting(true);
      await assessmentsApi.create({
        title,
        courseId: formCourseId || undefined,
        sectionId: formSectionId || undefined,
        courseName: formCourseName || undefined,
        sectionName: formSectionName || undefined,
        questions: formQuestions,
        timeMinutes: formTimeMinutes,
        difficulty: formDifficulty,
      });
      toast.success("Quiz created");
      setNewQuizOpen(false);
      resetForm();
      loadAssessments();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to create quiz";
      toast.error(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalQuizzes = assessments.length;
  const totalAttempts = assessments.reduce((s, a) => s + (a.attempts ?? 0), 0);
  const withScores = assessments.filter((a) => a.avgScore !== "-" && a.avgScore !== "");
  const avgScore = withScores.length
    ? Math.round(
        withScores.reduce((s, a) => s + parseFloat(String(a.avgScore).replace("%", "")) || 0, 0) / withScores.length
      ) + "%"
    : "—";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Assessments</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage quizzes and practice tests
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setNewQuizOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700"
        >
          <Plus className="size-4" />
          New Quiz
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((m, i) => (
          <div
            key={m.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {m.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {i === 0 ? totalQuizzes : i === 1 ? totalAttempts : i === 2 ? avgScore : "—"}
                </p>
                <p className="mt-1 text-sm text-slate-600">{m.caption}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-2">
                <m.icon className="size-5 text-slate-600" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-full w-3/4 rounded-full bg-slate-400" />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <ClipboardList className="size-5 text-slate-600" />
            All Assessments
          </h3>
          <p className="text-sm text-slate-500">View attempts, scores and settings</p>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading…</div>
        ) : assessments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No quizzes yet. Click &quot;New Quiz&quot; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Quiz Title</th>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-6 py-3">Section</th>
                  <th className="px-6 py-3">Questions</th>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Difficulty</th>
                  <th className="px-6 py-3">Attempts</th>
                  <th className="px-6 py-3">Avg Score</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">{row.title}</td>
                    <td className="px-6 py-3 text-slate-600">{row.courseName || "—"}</td>
                    <td className="px-6 py-3">
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {row.sectionName || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{row.questions} Questions</td>
                    <td className="px-6 py-3 text-slate-600">{row.timeMinutes} min</td>
                    <td className="px-6 py-3">
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {row.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{row.attempts} Attempts</td>
                    <td className="px-6 py-3 font-medium text-slate-700">{row.avgScore}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/assessments/${row.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <Pencil className="size-3.5" />
                          Add questions
                        </Link>
                        <button className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-50">
                          <MoreHorizontal className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Dialog open={newQuizOpen} onOpenChange={setNewQuizOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Quiz</DialogTitle>
            <DialogDescription>
              Create a new assessment. You can link it to a course and section.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-title">Title *</Label>
              <Input
                id="quiz-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. CPA Section 1 – Financial Accounting"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select
                  value={formCourseId || "none"}
                  onValueChange={(v) => {
                    setFormCourseId(v === "none" ? "" : v);
                    setFormSectionId("");
                    const c = courses.find((x) => x.id === v);
                    setFormCourseName(c?.name ?? "");
                    setFormSectionName("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select
                  value={formSectionId || "none"}
                  onValueChange={(v) => {
                    setFormSectionId(v === "none" ? "" : v);
                    const s = sections.find((x) => x.id === v);
                    setFormSectionName(s?.name ?? "");
                  }}
                  disabled={!formCourseId || sections.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {sections.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-questions">Questions</Label>
                <Input
                  id="quiz-questions"
                  type="number"
                  min={1}
                  value={formQuestions}
                  onChange={(e) => setFormQuestions(parseInt(e.target.value, 10) || 10)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-time">Time (minutes)</Label>
                <Input
                  id="quiz-time"
                  type="number"
                  min={1}
                  value={formTimeMinutes}
                  onChange={(e) => setFormTimeMinutes(parseInt(e.target.value, 10) || 15)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={formDifficulty} onValueChange={setFormDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewQuizOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create Quiz"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
