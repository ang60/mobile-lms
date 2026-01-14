"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contentApi, type ContentItem, type CreateContentDto } from "@/lib/api/content";
import { Edit, Eye, FileText, Filter, FolderGit2, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
        subject: "General", // Default subject
        lessons: 1, // Default lessons
        type: selectedFile.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'epub',
        // previewUrl is optional, don't include if empty
      };

      await contentApi.upload(uploadData, selectedFile, token || undefined);
      toast.success("Content uploaded successfully");
      setIsCreateOpen(false);
      resetForm();
      loadContent();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to upload content";
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

  const filteredContent = content.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Content Operations
          </h2>
          <p className="mt-2 max-w-2xl text-base font-medium text-slate-600">
            Manage modules, upload new files, and monitor the health of the CPA
            curriculum in one place. Streamlined for publishers and academic
            leads.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FolderGit2 className="size-4" />
            Version history
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateOpen(true)}>
            <Plus className="size-4" />
            Upload Content
          </Button>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search modules, notes, mock exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="size-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Bulk actions
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading content...</div>
        ) : filteredContent.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {searchQuery ? "No content found matching your search." : "No content available. Upload your first content item."}
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {filteredContent.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <span className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                        Published
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                      <span>{item.lessons} lessons</span>
                      <span>{item.subject}</span>
                      <span>KES {item.price.toLocaleString()}</span>
                      <span>Updated {formatDate(item.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(item)}
                  >
                    <Edit className="size-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (item.previewUrl) {
                        window.open(item.previewUrl, '_blank', 'noopener,noreferrer');
                      } else {
                        toast.error("No preview URL available for this content");
                      }
                    }}
                  >
                    <Eye className="size-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(item)}
                  >
                    <Trash2 className="size-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
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
                <Label htmlFor="edit-subject">Subject *</Label>
                <Input
                  id="edit-subject"
                  value={editFormData.subject}
                  onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
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
