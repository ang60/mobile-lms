"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Upload,
  Lock,
  Camera,
  Copy,
  Download,
  FileText,
  Video,
  Flame,
  Calendar,
  Rocket,
  Lightbulb,
  Check,
} from "lucide-react";
import { contentApi, type CreateContentDto } from "@/lib/api/content";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const formats = ["PDF", "EPUB"];
const SECTION_LABELS: Record<string, string> = {
  "Section 1": "Financial Accounting",
  "Section 2": "Management Accounting",
  "Section 3": "Taxation",
  "Section 4": "Auditing and Assurance",
  "Section 5": "Governance, Risk & Ethics",
  "Section 6": "Financial Reporting",
};
const SECTIONS = ["Section 1", "Section 2", "Section 3", "Section 4", "Section 5", "Section 6"];

function getToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("token") || undefined;
}

function UploadNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [section, setSection] = useState<string | null>(null);
  const [markAsTrending, setMarkAsTrending] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);

  const urlCourseId = searchParams.get("courseId") ?? undefined;
  const urlSectionId = searchParams.get("sectionId") ?? undefined;
  const urlCourseName = searchParams.get("courseName") ?? "";
  const urlSectionName = searchParams.get("sectionName") ?? "";

  useEffect(() => {
    if (urlCourseName) setSection(urlSectionName || null);
  }, [urlCourseName, urlSectionName]);

  const toggles = [
    { label: "Screenshot Block", icon: Camera, on: true },
    { label: "DRM Encryption", icon: Lock, on: true },
    { label: "Disable Downloads", icon: Download, on: true },
    { label: "Copy Protection", icon: Copy, on: true },
    { label: "Block Recording", icon: Video, on: false },
  ];

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const ext = file.name.toLowerCase().split(".").pop();
    if (ext !== "pdf" && ext !== "epub" && ext !== "doc" && ext !== "docx") {
      toast.error("Please select a PDF or EPUB file");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      toast.error("File must be under 500MB");
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handlePublish = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Please enter a title");
      return;
    }
    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      toast.error("Please enter a description");
      return;
    }
    const priceNum = parseFloat(price.replace(/,/g, ""));
    if (Number.isNaN(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid price (0 or greater)");
      return;
    }
    const token = getToken();
    if (!token) {
      toast.error("Please sign in and try again");
      return;
    }

    const contentType = selectedFile.name.toLowerCase().endsWith(".pdf") ? "pdf" : "epub";
    const subject = urlCourseName || "CPA";
    const data: CreateContentDto = {
      title: trimmedTitle,
      description: trimmedDesc,
      subject,
      price: priceNum,
      type: contentType,
      lessons: 1,
      ...(urlCourseId ? { courseId: urlCourseId } : {}),
      ...(urlSectionId ? { sectionId: urlSectionId } : {}),
    };

    setUploading(true);
    try {
      await contentApi.upload(data, selectedFile, token);
      toast.success("Material published successfully");
      if (urlCourseId) {
        router.push(`/courses/${urlCourseId}`);
      } else {
        router.push("/content");
      }
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to upload";
      toast.error(msg);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const suggestedTitle = section && SECTION_LABELS[section]
    ? `CPA ${section} - ${SECTION_LABELS[section]}`
    : "";

  const FILE_INPUT_ID = "upload-new-file-input";

  return (
    <div className="relative z-0 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Upload New</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add new learning materials with optional protection settings
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <input
            id={FILE_INPUT_ID}
            ref={fileInputRef}
            type="file"
            accept=".pdf,.epub"
            className="sr-only"
            onChange={(e) => {
              handleFileSelect(e.target.files?.[0] || null);
              e.target.value = "";
            }}
            aria-label="Choose file to upload"
          />
          <label
            htmlFor={FILE_INPUT_ID}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`block cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
              dragActive ? "border-slate-400 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <Upload className="mx-auto size-12 text-slate-400" />
            <p className="mt-4 font-medium text-slate-700">
              {selectedFile ? selectedFile.name : "Drop files here or click to browse"}
            </p>
            {selectedFile && (
              <p className="mt-1 text-sm text-slate-500">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {!selectedFile && (
              <p className="mt-1 text-sm text-slate-500">
                Supported: PDF, EPUB — Max 500MB per file
              </p>
            )}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {formats.map((f) => (
                <span
                  key={f}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  {f}
                </span>
              ))}
            </div>
            {selectedFile && (
              <span className="mt-3 inline-block rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700">
                Click here again to change file
              </span>
            )}
          </label>
          {selectedFile && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Remove file
              </button>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-slate-600" />
              <div>
                <h3 className="font-bold text-slate-900">Material Details</h3>
                <p className="text-sm text-slate-500">Fill in the information for this material</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={suggestedTitle || "e.g. CPA Section 1 – Financial Accounting"}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief overview of what students will learn..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Price (KES) *
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 0 or 1299"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Course</p>
                <p className="mb-2 text-sm font-medium text-slate-700">{urlCourseName || "CPA"}</p>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Section
                </label>
                {urlSectionId ? (
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                    {urlSectionName}
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Select section">
                      {SECTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setSection(s);
                          }}
                          className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors select-none ${
                            section === s
                              ? "border-slate-800 bg-slate-800 text-white"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {section && suggestedTitle && (
                      <p className="mt-2 text-xs text-slate-500">
                        <button
                          type="button"
                          onClick={() => setTitle(suggestedTitle)}
                          className="text-slate-700 font-medium underline hover:text-slate-900"
                        >
                          Use suggested title: {suggestedTitle}
                        </button>
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMarkAsTrending((prev) => !prev)}
                  className={`cursor-pointer inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    markAsTrending
                      ? "border-slate-800 bg-slate-800 text-white hover:bg-slate-700"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {markAsTrending ? <Check className="size-4" /> : <Flame className="size-4" />}
                  {markAsTrending ? "Trending" : "Mark as Trending"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalendarDate(scheduledDate ?? undefined);
                    setScheduleModalOpen(true);
                  }}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                >
                  <Calendar className="size-4" />
                  {scheduledDate
                    ? `Release: ${scheduledDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                    : "Schedule Release"}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePublish}
              disabled={uploading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60 disabled:pointer-events-none"
            >
              <Rocket className="size-4" />
              {uploading ? "Publishing…" : "Publish Material"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Lock className="size-5 text-slate-600" />
              <div>
                <h3 className="font-bold text-slate-900">Content Protection</h3>
                <p className="text-sm text-slate-500">DRM & security settings</p>
              </div>
            </div>
            <ul className="mt-4 space-y-4">
              {toggles.map((t) => (
                <li key={t.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <t.icon className="size-4 text-slate-500" />
                    {t.label}
                  </span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked={t.on} className="peer sr-only" />
                    <span className="h-5 w-10 rounded-full bg-slate-200 transition peer-checked:bg-slate-600" />
                    <span className="absolute left-1 top-1 size-3 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-5 text-slate-600" />
              <h3 className="font-bold text-slate-900">Implementation Notes</h3>
            </div>
            <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Android: FLAG_SECURE window flag</li>
              <li>IOS: preventScreenCaptureAsync (Expo)</li>
              <li>DRM: CloudFront signed URLs (15 min)</li>
              <li>Storage: Never cached to device</li>
            </ul>
          </div>
        </div>
      </div>

      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Release</DialogTitle>
            <DialogDescription>
              Choose the date when this material should be published. Leave unset to publish immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <CalendarComponent
              mode="single"
              selected={calendarDate}
              onSelect={(date) => setCalendarDate(date)}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </div>
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setScheduledDate(null);
                setCalendarDate(undefined);
                setScheduleModalOpen(false);
                toast.info("Release schedule cleared");
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (calendarDate) {
                  setScheduledDate(calendarDate);
                  toast.success(
                    `Scheduled for ${calendarDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
                  );
                } else {
                  setScheduledDate(null);
                }
                setScheduleModalOpen(false);
              }}
            >
              {calendarDate ? "Confirm date" : "Publish immediately"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UploadNewPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-500">Loading...</div>}>
      <UploadNewContent />
    </Suspense>
  );
}
