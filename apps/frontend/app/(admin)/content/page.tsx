"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contentApi, type ContentItem, type CreateContentDto } from "@/lib/api/content";
import { Grid3X3, List, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
  });
  const [editFormData, setEditFormData] = useState<CreateContentDto>({
    title: "",
    description: "",
    subject: "",
    price: 0,
    previewUrl: "",
    type: "pdf",
    lessons: 0,
  });

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await contentApi.list();
      setContent(data);
    } catch (error) {
      toast.error("Failed to load content");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const getToken = (): string | undefined => {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem("token") || undefined;
  };

  const handleCreate = async () => {
    try {
      if (!selectedFile) {
        toast.error("Please select a file to upload");
        return;
      }

      // Get token from localStorage (should be set by ensureAdminToken)
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required. Please refresh the page to auto-login.");
        return;
      }
      
      // Prepare data with defaults for required fields not shown in form
      const uploadData: CreateContentDto = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        subject: "CPA", // Course
        lessons: 1, // Default lessons
        type: selectedFile.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'epub',
        // previewUrl is optional, don't include if empty
      };

      await contentApi.upload(uploadData, selectedFile, token || undefined);
      toast.success("Content uploaded successfully");
      setIsCreateOpen(false);
      resetForm();
      loadContent();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload content";
      toast.error(errorMessage);
      console.error("Upload error:", error);
      
      // Show more helpful error if it's a network error
      if (errorMessage.includes("Network error") || errorMessage.includes("Failed to fetch")) {
        console.error("Please check:");
        console.error("1. Is the API server running?");
        console.error("2. Is NEXT_PUBLIC_API_URL set correctly in .env.local?");
        console.error("3. Are CORS settings configured properly?");
      }
    }
  };

  const handleEdit = async () => {
    if (!selectedContent) return;
    try {
      const token = getToken();
      if (!token) {
        toast.error("Authentication required. Please refresh the page to auto-login.");
        return;
      }
      await contentApi.update(selectedContent.id, editFormData, token);
      toast.success("Content updated successfully");
      setIsEditOpen(false);
      resetForm();
      setSelectedContent(null);
      loadContent();
    } catch (error) {
      toast.error("Failed to update content");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!selectedContent) return;
    try {
      const token = getToken();
      if (!token) {
        toast.error("Authentication required. Please refresh the page to auto-login.");
        return;
      }
      await contentApi.delete(selectedContent.id, token);
      toast.success("Content deleted successfully");
      setIsDeleteOpen(false);
      setSelectedContent(null);
      loadContent();
    } catch (error) {
      toast.error("Failed to delete content");
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: 0,
    });
    setSelectedFile(null);
    setEditFormData({
      title: "",
      description: "",
      subject: "",
      price: 0,
      previewUrl: "",
      type: "pdf",
      lessons: 0,
    });
  };

  const openEditDialog = (item: ContentItem) => {
    setSelectedContent(item);
    setEditFormData({
      title: item.title,
      description: item.description,
      subject: item.subject,
      price: item.price,
      previewUrl: item.previewUrl,
      type: item.type,
      lessons: item.lessons,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (item: ContentItem) => {
    setSelectedContent(item);
    setIsDeleteOpen(true);
  };

  const courseOptions = ["All", "CPA"];
  const sectionOptions = ["All", "Section 1", "Section 2", "Section 3", "Section 4", "Section 5", "Section 6"];
  const getSectionFromTitle = (title: string): string => {
    const m = title.match(/CPA Section (\d)/i);
    return m ? `Section ${m[1]}` : "—";
  };
  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === "All" || item.subject === courseFilter;
    const itemSection = getSectionFromTitle(item.title);
    const matchesSection = sectionFilter === "All" || itemSection === sectionFilter;
    return matchesSearch && matchesCourse && matchesSection;
  });

  const getInitials = (title: string) =>
    title
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Materials</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage all learning content and materials.
          </p>
        </div>
        <Link
          href="/upload-new"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          <Plus className="size-4" />
          Upload New
        </Link>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Course</span>
            {courseOptions.map((c) => (
              <button
                key={c}
                onClick={() => setCourseFilter(c)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  courseFilter === c ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
            <span className="ml-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Section</span>
            {sectionOptions.map((s) => (
              <button
                key={s}
                onClick={() => setSectionFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  sectionFilter === s ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg border p-2 ${viewMode === "grid" ? "border-slate-800 bg-slate-100" : "border-slate-200"}`}
              >
                <Grid3X3 className="size-4 text-slate-600" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg border p-2 ${viewMode === "list" ? "border-slate-800 bg-slate-100" : "border-slate-200"}`}
              >
                <List className="size-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading content...</div>
        ) : filteredContent.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {searchQuery || courseFilter !== "All" || sectionFilter !== "All"
              ? "No content found matching your filters."
              : "No content available. Upload your first content item."}
          </div>
        ) : viewMode === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-6 py-3">Section</th>
                  <th className="px-6 py-3">Pages</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Views</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContent.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-700">
                          {getInitials(item.title)}
                        </div>
                        <div>
                          <span className="font-medium text-slate-900">{item.title}</span>
                          <span className="ml-2 text-xs text-slate-500">★4.0</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {item.subject}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {getSectionFromTitle(item.title)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{item.lessons}</td>
                    <td className="px-6 py-3 text-slate-600">KES {item.price.toLocaleString()}</td>
                    <td className="px-6 py-3 text-slate-600">—</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Live
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openDeleteDialog(item)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredContent.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-700">
                    {getInitials(item.title)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-slate-900 truncate">{item.title}</h3>
                    <p className="text-xs text-slate-500">{item.subject} · {getSectionFromTitle(item.title)} · KES {item.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(item)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDeleteDialog(item)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && filteredContent.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-sm text-slate-500">
            <span>Showing {filteredContent.length} of {content.length} materials</span>
            <div className="flex gap-1">
              <button className="rounded border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50">1</button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Content</DialogTitle>
            <DialogDescription>
              Upload a new content file to the library. Fill in the required fields and select a file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">Content File *</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.epub,.doc,.docx,.txt"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-sm text-slate-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., CPA Section 1 – Financial Accounting"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the content"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (KES) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              Upload Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Update the content item details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Course *</Label>
                <Input
                  id="edit-subject"
                  value={editFormData.subject}
                  onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                  placeholder="e.g. CPA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (KES) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type *</Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(value: "pdf" | "epub") => setEditFormData({ ...editFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="epub">EPUB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lessons">Lessons *</Label>
                <Input
                  id="edit-lessons"
                  type="number"
                  value={editFormData.lessons}
                  onChange={(e) => setEditFormData({ ...editFormData, lessons: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-previewUrl">Preview URL *</Label>
              <Input
                id="edit-previewUrl"
                value={editFormData.previewUrl}
                onChange={(e) => setEditFormData({ ...editFormData, previewUrl: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the content item
              &ldquo;{selectedContent?.title}&rdquo;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
