import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Edit2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Upload,
  ArrowLeft,
  X,
  Search,
  Database
} from "lucide-react";

export default function PosterManagement() {
  const { conferenceId } = useParams<{ conferenceId: string }>();
  const navigate = useNavigate();

  // State management
  const [posters, setPosters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState<any>(null);

  // Form Fields State
  const [posterNumber, setPosterNumber] = useState("");
  const [title, setTitle] = useState("");
  const [presenterName, setPresenterName] = useState("");
  const [coPresenters, setCoPresenters] = useState("");
  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  
  // File upload states
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Bulk Upload State
  const [bulkCsvText, setBulkCsvText] = useState("");

  // Refs for file inputs
  const posterInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Load posters on mount
  useEffect(() => {
    fetchPosters();
  }, [conferenceId]);

  const fetchPosters = async () => {
    if (!conferenceId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posters/admin/list/${conferenceId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch posters roster.");
      const data = await res.json();
      setPosters(data);
    } catch (err: any) {
      setError(err.message || "An error occurred fetching posters.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingPoster(null);
    setPosterNumber("");
    setTitle("");
    setPresenterName("");
    setCoPresenters("");
    setInstitution("");
    setDepartment("");
    setCategory("");
    setPosterFile(null);
    setThumbnailFile(null);
    setError("");
    setIsFormModalOpen(true);
  };

  const openEditModal = (poster: any) => {
    setEditingPoster(poster);
    setPosterNumber(poster.posterNumber);
    setTitle(poster.title);
    setPresenterName(poster.presenterName);
    setCoPresenters(poster.coPresenters || "");
    setInstitution(poster.institution || "");
    setDepartment(poster.department || "");
    setCategory(poster.category || "");
    setPosterFile(null);
    setThumbnailFile(null);
    setError("");
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posterNumber.trim() || !title.trim() || !presenterName.trim() || !conferenceId) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("posterNumber", posterNumber.trim());
      formData.append("title", title.trim());
      formData.append("presenterName", presenterName.trim());
      formData.append("coPresenters", coPresenters.trim());
      formData.append("institution", institution.trim());
      formData.append("department", department.trim());
      formData.append("category", category.trim());
      formData.append("conferenceId", conferenceId);

      if (posterFile) {
        formData.append("posterFile", posterFile);
      }
      if (thumbnailFile) {
        formData.append("thumbnailFile", thumbnailFile);
      }

      const url = editingPoster 
        ? `${import.meta.env.VITE_API_URL}/api/posters/admin/edit/${editingPoster._id}`
        : `${import.meta.env.VITE_API_URL}/api/posters/admin/create`;

      const method = editingPoster ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save poster.");
      }

      setSuccess(editingPoster ? "Poster updated successfully!" : "Poster added successfully!");
      setIsFormModalOpen(false);
      fetchPosters();
    } catch (err: any) {
      setError(err.message || "Failed to save poster.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this scientific presentation?")) return;
    
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posters/admin/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete poster.");
      }

      setSuccess("Poster removed successfully!");
      fetchPosters();
    } catch (err: any) {
      setError(err.message || "Failed to delete poster.");
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCsvText.trim() || !conferenceId) {
      setError("Please paste valid CSV data.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Parse CSV input text
      const lines = bulkCsvText.split("\n");
      const parsedPosters: any[] = [];

      lines.forEach((line, index) => {
        const row = line.split(",").map(val => val.trim());
        // Expected format: PosterNumber, Title, PresenterName, CoPresenters, Institution, Department, Category, ImageUrl, ThumbnailUrl
        if (row.length >= 3 && row[0] && row[1] && row[2]) {
          parsedPosters.push({
            posterNumber: row[0],
            title: row[1],
            presenterName: row[2],
            coPresenters: row[3] || "",
            institution: row[4] || "",
            department: row[5] || "",
            category: row[6] || "",
            imageUrl: row[7] || "",
            thumbnailUrl: row[8] || row[7] || ""
          });
        }
      });

      if (parsedPosters.length === 0) {
        throw new Error("Could not parse any valid poster rows. Verify your CSV format.");
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posters/admin/bulk-upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ conferenceId, posters: parsedPosters })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to bulk upload posters.");
      }

      setSuccess(`Successfully imported ${data.count} presentations!`);
      setIsBulkModalOpen(false);
      setBulkCsvText("");
      fetchPosters();
    } catch (err: any) {
      setError(err.message || "Failed to complete bulk import.");
    } finally {
      setSubmitting(false);
    }
  };

  // Local table search query filter
  const filteredList = posters.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.posterNumber.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.presenterName.toLowerCase().includes(q) ||
      (p.institution || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F4F7FB] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">

        {/* Back and Action header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate(`/admin/conference/${conferenceId}`)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-all mb-2"
            >
              <ArrowLeft size={16} />
              <span>Back to Workspace</span>
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Scientific Poster Settings
            </h1>
            <p className="text-sm font-semibold text-slate-400">
              Manage scientific presentations, uploads, categories, and bulk rosters.
            </p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex-1 sm:flex-none px-5 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <Database size={15} />
              <span>Bulk CSV Seeding</span>
            </button>
            <button
              onClick={openAddModal}
              className="flex-1 sm:flex-none px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <Plus size={15} />
              <span>Add Presentation</span>
            </button>
          </div>
        </div>

        {/* Success and Error notifications */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold shadow-sm">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold shadow-sm">
            🟢 {success}
          </div>
        )}

        {/* Database Search & List Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-80">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Filter by title, author, number..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-bold text-xs text-slate-700 transition-all shadow-inner"
              />
            </div>

            <div className="text-xs font-bold text-slate-400">
              Total presentations in roster: <span className="text-slate-800 font-extrabold">{posters.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading scientific presentations database...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-xl mb-4">
                📑
              </div>
              <h3 className="font-extrabold text-slate-750 text-sm">No posters found</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-xs font-semibold leading-relaxed">
                Add presentations manually or use CSV import to seed scientific entries.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-250/60 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <th className="py-4 px-6 w-20">Number</th>
                    <th className="py-4 px-6">Presentation Details</th>
                    <th className="py-4 px-6 w-44">Presenter</th>
                    <th className="py-4 px-6 w-48">Category</th>
                    <th className="py-4 px-6 w-36">Media URLs</th>
                    <th className="py-4 px-6 w-28 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                  {filteredList.map((poster) => (
                    <tr key={poster._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-extrabold rounded-lg border border-slate-200">
                          {poster.posterNumber}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-sm">
                        <div className="font-extrabold text-slate-800 leading-snug">{poster.title}</div>
                        {poster.institution && (
                          <div className="text-[10px] text-slate-400 mt-1 font-bold truncate">
                            🏛️ {poster.institution}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{poster.presenterName}</div>
                        {poster.coPresenters && (
                          <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                            Co-Authors: {poster.coPresenters}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {poster.category ? (
                          <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 font-bold rounded text-[10px] uppercase">
                            {poster.category}
                          </span>
                        ) : (
                          <span className="text-slate-350 italic font-medium">Uncategorized</span>
                        )}
                      </td>
                      <td className="py-4 px-6 flex gap-2 items-center min-h-[4.5rem]">
                        <a
                          href={poster.imageUrl.startsWith("/uploads/") ? `${import.meta.env.VITE_API_URL}${poster.imageUrl}` : poster.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
                          title="View Large Image / PDF"
                        >
                          <FileText size={14} />
                        </a>
                        <a
                          href={poster.thumbnailUrl.startsWith("/uploads/") ? `${import.meta.env.VITE_API_URL}${poster.thumbnailUrl}` : poster.thumbnailUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
                          title="View Thumbnail"
                        >
                          <ImageIcon size={14} />
                        </a>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(poster)}
                            className="p-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 rounded-xl transition-all"
                            title="Edit Poster"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(poster._id)}
                            className="p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl transition-all"
                            title="Delete Poster"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- MODAL 1: ADD / EDIT DIALOG --- */}
        {isFormModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-5 border-b border-slate-200/60 flex justify-between items-center">
                <h3 className="text-lg font-extrabold text-slate-900">
                  {editingPoster ? "Edit Poster Details" : "Create Poster Record"}
                </h3>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      Poster Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. P-01"
                      value={posterNumber}
                      onChange={e => setPosterNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cardiology"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Poster Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter visual title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold text-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      Presenter Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Dr. John Doe"
                      value={presenterName}
                      onChange={e => setPresenterName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      Co-Presenters
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Smith, Bob Johnson"
                      value={coPresenters}
                      onChange={e => setCoPresenters(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      Institution
                    </label>
                    <input
                      type="text"
                      placeholder="AIIMS Hospital"
                      value={institution}
                      onChange={e => setInstitution(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="Radiology"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* File upload grids */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      Poster Image/PDF * {editingPoster && "(Leave blank to keep current)"}
                    </label>
                    <div 
                      onClick={() => posterInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-250 hover:border-blue-500 bg-slate-50 hover:bg-slate-100/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Upload size={18} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500">
                        {posterFile ? posterFile.name : "Select Image or PDF file"}
                      </span>
                    </div>
                    <input
                      ref={posterInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={e => setPosterFile(e.target.files ? e.target.files[0] : null)}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      Thumbnail Image (Optional)
                    </label>
                    <div 
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-250 hover:border-blue-500 bg-slate-50 hover:bg-slate-100/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <ImageIcon size={18} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500">
                        {thumbnailFile ? thumbnailFile.name : "Select JPG/PNG Thumbnail"}
                      </span>
                    </div>
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={e => setThumbnailFile(e.target.files ? e.target.files[0] : null)}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-all text-xs flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <span>Save Record</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL 2: BULK UPLOAD CSV DIALOG --- */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-5 border-b border-slate-200/60 flex justify-between items-center">
                <h3 className="text-lg font-extrabold text-slate-900">Bulk Seed Posters</h3>
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBulkUpload} className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                  <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider mb-1">CSV Format Guidelines</h4>
                  <p className="text-[10px] text-blue-600 font-semibold leading-relaxed">
                    Paste raw comma-separated rows. Do not include headers. Format:<br />
                    <code className="bg-white px-2 py-0.5 rounded border border-blue-200 mt-1 inline-block font-mono text-[9px]">
                      PosterNumber, Title, PresenterName, CoPresenters, Institution, Department, Category, ImageUrl, ThumbnailUrl
                    </code>
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                    Raw CSV Data Input
                  </label>
                  <textarea
                    placeholder="P-01, Heart Valve Roster, Dr. John, Dr. Jane, AIIMS Hospital, Cardiology, Heart, https://example.com/poster1.jpg&#10;P-02, Brain CT scan study, Dr. Alice, , National Health, Neurology, Brain, https://example.com/poster2.jpg"
                    value={bulkCsvText}
                    onChange={e => setBulkCsvText(e.target.value)}
                    className="w-full h-56 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 font-mono text-[10px] text-slate-800 shadow-inner"
                    required
                  ></textarea>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-all text-xs flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Seeding Database...</span>
                      </>
                    ) : (
                      <span>Complete Bulk Import</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
