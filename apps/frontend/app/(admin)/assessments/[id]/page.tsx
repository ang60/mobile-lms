"use client";

import { assessmentsApi, type AssessmentItem, type QuestionItem } from "@/lib/api/assessments";
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
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [assessment, setAssessment] = useState<AssessmentItem | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"mcq" | "true_false">("mcq");
  const [options, setOptions] = useState(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [list, qs] = await Promise.all([
        assessmentsApi.list(),
        assessmentsApi.getQuestions(id),
      ]);
      const a = list.find((x) => x.id === id);
      setAssessment(a ?? null);
      setQuestions(qs);
    } catch (e) {
      toast.error("Failed to load assessment");
      console.error(e);
      router.push("/assessments");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = questionText.trim();
    if (!text) {
      toast.error("Enter the question text");
      return;
    }
    const opts = questionType === "true_false" ? ["True", "False"] : options.filter((o) => o.trim());
    if (questionType === "mcq" && opts.length < 2) {
      toast.error("Add at least 2 options for MCQ");
      return;
    }
    if (correctIndex < 0 || correctIndex >= opts.length) {
      toast.error("Select the correct answer");
      return;
    }
    try {
      setSubmitting(true);
      await assessmentsApi.addQuestion(id, {
        questionText: text,
        type: questionType,
        options: opts,
        correctIndex,
      });
      toast.success("Question added");
      setAddOpen(false);
      setQuestionText("");
      setQuestionType("mcq");
      setOptions(["", ""]);
      setCorrectIndex(0);
      load();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to add question";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      toast.error("CSV needs header row + at least one question");
      e.target.value = "";
      return;
    }
    const header = lines[0].toLowerCase();
    const hasType = header.includes("type");
    const rows = lines.slice(1);
    setUploading(true);
    let added = 0;
    try {
      for (const line of rows) {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length < 2) continue;
        const questionText = cols[0];
        if (!questionText) continue;
        const type = (hasType && cols[1]?.toLowerCase() === "true_false") ? "true_false" : "mcq";
        const optionCols = cols.slice(hasType ? 2 : 1).filter((c) => c);
        const options = type === "true_false" ? ["True", "False"] : (optionCols.length >= 2 ? optionCols : [cols[1] || "", cols[2] || "Option 2"]);
        const correctIdx = type === "true_false"
          ? (options[0]?.toLowerCase() === "true" ? 0 : 1)
          : 0;
        await assessmentsApi.addQuestion(id, { questionText, type, options, correctIndex: correctIdx });
        added++;
      }
      toast.success(`Added ${added} question(s)`);
      load();
    } catch (err) {
      toast.error("Upload failed");
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await assessmentsApi.deleteQuestion(id, qId);
      toast.success("Question deleted");
      load();
    } catch {
      toast.error("Failed to delete question");
    }
  };

  if (loading || !assessment) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        {loading ? "Loading…" : "Assessment not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/assessments"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Back to assessments"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{assessment.title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {assessment.courseName && `${assessment.courseName} · `}
              {assessment.sectionName || "Quiz"} · {assessment.questions} questions · {assessment.timeMinutes} min
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleUploadCsv}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2"
          >
            <Upload className="size-4" />
            {uploading ? "Uploading…" : "Upload CSV"}
          </Button>
          <Button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700">
            <Plus className="size-4" />
            Add question
          </Button>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          <strong>Upload CSV format:</strong> one question per line. Line 1: <code className="rounded bg-slate-100 px-1">questionText, type, option1, option2, ...</code> (type = <code className="rounded bg-slate-100 px-1">mcq</code> or <code className="rounded bg-slate-100 px-1">true_false</code>). First option is treated as correct for MCQ; for true_false use True or False as options.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Questions ({questions.length})</h3>
          <p className="text-sm text-slate-500">
            Add questions one by one or upload a CSV file. MCQ = multiple choice, True/False = two options.
          </p>
        </div>
        {questions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="font-medium">No questions yet</p>
            <p className="mt-1 text-sm">Click &quot;Add question&quot; to add the first question.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {questions.map((q, idx) => (
              <li key={q.id} className="flex items-start justify-between gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">
                    {idx + 1}. {q.questionText}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {q.type === "true_false" ? "True / False" : "MCQ"} · Correct: {q.options[q.correctIndex] ?? "—"}
                  </p>
                  {q.type === "mcq" && q.options.length > 0 && (
                    <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                      {q.options.map((opt, i) => (
                        <li key={i}>
                          {opt}
                          {i === q.correctIndex && " ✓"}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-slate-600 hover:text-red-600"
                  onClick={() => handleDeleteQuestion(q.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add question</DialogTitle>
            <DialogDescription>
              Add a multiple choice (MCQ) or True/False question. Set the correct answer.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="q-text">Question text *</Label>
              <textarea
                id="q-text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. What is the double-entry for a sale on credit?"
                className="min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="qtype"
                    checked={questionType === "mcq"}
                    onChange={() => { setQuestionType("mcq"); setOptions(["", ""]); setCorrectIndex(0); }}
                  />
                  <span className="text-sm">Multiple choice (MCQ)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="qtype"
                    checked={questionType === "true_false"}
                    onChange={() => { setQuestionType("true_false"); setCorrectIndex(0); }}
                  />
                  <span className="text-sm">True / False</span>
                </label>
              </div>
            </div>
            {questionType === "mcq" && (
              <div className="space-y-2">
                <Label>Options (correct one below)</Label>
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={correctIndex === i}
                      onChange={() => setCorrectIndex(i)}
                      className="mt-3"
                    />
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const next = [...options];
                        next[i] = e.target.value;
                        setOptions(next);
                      }}
                      placeholder={`Option ${i + 1}`}
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOptions((prev) => [...prev, ""])}
                  >
                    + Add option
                  </Button>
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOptions((prev) => prev.slice(0, -1));
                        setCorrectIndex((c) => Math.min(c, options.length - 2));
                      }}
                    >
                      Remove last
                    </Button>
                  )}
                </div>
              </div>
            )}
            {questionType === "true_false" && (
              <div className="space-y-2">
                <Label>Correct answer</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tf"
                      checked={correctIndex === 0}
                      onChange={() => setCorrectIndex(0)}
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tf"
                      checked={correctIndex === 1}
                      onChange={() => setCorrectIndex(1)}
                    />
                    <span>False</span>
                  </label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding…" : "Add question"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
