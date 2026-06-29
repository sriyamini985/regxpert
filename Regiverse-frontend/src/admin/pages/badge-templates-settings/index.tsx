import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Plus, Trash2, Save, Move, Settings, Layers, Type, 
  QrCode, Image as ImageIcon, RefreshCw, Copy, Check, Info, AlertTriangle, Download, Upload 
} from "lucide-react";
import QRCode from "react-qr-code";

interface BadgeField {
  id: string;
  type: string; // "name", "photo", "qr", "regId", "category", "city", "organization", "customText", "logo", "signature", "date", etc.
  label: string;
  x: number; // in mm
  y: number; // in mm
  width: number; // in mm
  height: number; // in mm
  fontSize: number; // in px
  fontWeight: string;
  fontStyle: string;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  borderRadius: number;
  opacity: number;
  shadow: string;
  alignment: string;
  rotation: number;
  letterSpacing: string;
  lineHeight: string;
  padding: string;
  photoFit: string;
  circular: boolean;
  qrErrorCorrection: string;
  qrBgColor: string;
  qrFgColor: string;
}

interface BadgeTemplate {
  _id?: string;
  conferenceId: string;
  name: string;
  category: string;
  backgroundImage: string;
  canvasWidthMm: number;
  canvasHeightMm: number;
  isDefault: boolean;
  fields: BadgeField[];
}

const FIELD_TYPES = [
  { type: "name", label: "Full Name", icon: <Type size={14} /> },
  { type: "photo", label: "Participant Photo", icon: <ImageIcon size={14} /> },
  { type: "qr", label: "QR Code", icon: <QrCode size={14} /> },
  { type: "regId", label: "Registration ID", icon: <Type size={14} /> },
  { type: "category", label: "Category", icon: <Type size={14} /> },
  { type: "designation", label: "Designation", icon: <Type size={14} /> },
  { type: "organization", label: "Hospital / Org", icon: <Type size={14} /> },
  { type: "city", label: "City", icon: <Type size={14} /> },
  { type: "state", label: "State", icon: <Type size={14} /> },
  { type: "customText", label: "Custom Text", icon: <Type size={14} /> }
];

const FONTS = ["system-ui", "sans-serif", "serif", "monospace", "Arial", "Georgia", "Courier New", "Impact"];

const BADGE_PRESETS = [
  { name: "Standard Card (CR80) (86x54mm)", width: 54, height: 86 },
  { name: "A6 Size Badge (148x105mm)", width: 105, height: 148 },
  { name: "A5 Size Badge (210x148mm)", width: 148, height: 210 },
  { name: "3x4 Inch Badge (102x76mm)", width: 76, height: 102 },
  { name: "4x6 Inch Badge (152x102mm)", width: 102, height: 152 }
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function BadgeTemplatesSettings() {
  const { conferenceId } = useParams();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<BadgeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<BadgeTemplate | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  
  // UI states
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewParticipant, setPreviewParticipant] = useState<any>({
    name: "DR. VENU GOPAL",
    regId: "RegID - ZGWI057",
    category: "Delegates",
    state: "TELANGANA",
    dynamicData: {
      Organization: "APEX CARE HOSPITAL",
      Designation: "SENIOR CONSULTANT"
    }
  });

  // Canvas config
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(2); // in mm
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Drag states
  const [dragMode, setDragMode] = useState<"drag" | "resize" | "rotate" | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, fieldX: 0, fieldY: 0, fieldW: 0, fieldH: 0, angle: 0 });

  // Load Templates & Conference Categories
  useEffect(() => {
    if (!conferenceId) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch Templates
        const tRes = await fetch(`${API_URL}/api/badge-templates/conference/${conferenceId}`);
        if (tRes.ok) {
          const data = await tRes.json();
          setTemplates(data);
          if (data.length > 0) {
            setSelectedTemplate(data[0]);
          }
        }

        // Fetch participants to collect categories
        const pRes = await fetch(`${API_URL}/api/participants/conference/${conferenceId}?admin=true`);
        if (pRes.ok) {
          const participants = await pRes.json();
          const cats = Array.from(new Set(participants.map((p: any) => p.category).filter(Boolean))) as string[];
          setCategories(cats);
        }
      } catch (err) {
        console.error("Failed to load settings details", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [conferenceId]);

  // Handle keyboard nudge movements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedTemplate || !activeFieldId || previewMode) return;
      const index = selectedTemplate.fields.findIndex(f => f.id === activeFieldId);
      if (index === -1) return;

      const field = selectedTemplate.fields[index];
      const step = e.shiftKey ? 0.2 : 1; // shift nudges smaller decimals
      let deltaX = 0;
      let deltaY = 0;

      if (e.key === "ArrowLeft") deltaX = -step;
      else if (e.key === "ArrowRight") deltaX = step;
      else if (e.key === "ArrowUp") deltaY = -step;
      else if (e.key === "ArrowDown") deltaY = step;
      else if (e.key === "Delete" || e.key === "Backspace") {
        // Delete field
        const updatedFields = selectedTemplate.fields.filter(f => f.id !== activeFieldId);
        setSelectedTemplate({ ...selectedTemplate, fields: updatedFields });
        setActiveFieldId(null);
        e.preventDefault();
        return;
      } else {
        return; // ignore other keys
      }

      e.preventDefault();
      const updatedFields = [...selectedTemplate.fields];
      updatedFields[index] = {
        ...field,
        x: Math.max(0, Math.min(selectedTemplate.canvasWidthMm - field.width, field.x + deltaX)),
        y: Math.max(0, Math.min(selectedTemplate.canvasHeightMm - field.height, field.y + deltaY))
      };
      setSelectedTemplate({ ...selectedTemplate, fields: updatedFields });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTemplate, activeFieldId, previewMode]);

  // Create template
  const handleCreateTemplate = () => {
    const newT: BadgeTemplate = {
      conferenceId: conferenceId || "",
      name: "New Badge Template",
      category: categories[0] || "Delegates",
      backgroundImage: "",
      canvasWidthMm: 54,
      canvasHeightMm: 86,
      isDefault: templates.length === 0,
      fields: [
        {
          id: "field-name-" + Date.now(),
          type: "name",
          label: "Full Name",
          x: 5,
          y: 35,
          width: 44,
          height: 12,
          fontSize: 16,
          fontWeight: "bold",
          fontStyle: "normal",
          fontFamily: "system-ui",
          color: "#0f172a",
          backgroundColor: "transparent",
          borderRadius: 0,
          opacity: 1,
          shadow: "none",
          alignment: "center",
          rotation: 0,
          letterSpacing: "normal",
          lineHeight: "1.2",
          padding: "0px",
          photoFit: "cover",
          circular: false,
          qrErrorCorrection: "L",
          qrBgColor: "#ffffff",
          qrFgColor: "#000000"
        }
      ]
    };
    setSelectedTemplate(newT);
    setActiveFieldId(null);
  };

  // Clone Template
  const handleCloneTemplate = async (template: BadgeTemplate) => {
    if (!template._id) return;
    try {
      const res = await fetch(`${API_URL}/api/badge-templates/${template._id}/clone`, {
        method: "POST"
      });
      if (res.ok) {
        const cloned = await res.json();
        setTemplates(prev => [...prev, cloned]);
        setSelectedTemplate(cloned);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Template
  const handleDeleteTemplate = async (template: BadgeTemplate) => {
    if (!window.confirm(`Are you sure you want to delete "${template.name}"?`)) return;
    try {
      if (template._id) {
        const res = await fetch(`${API_URL}/api/badge-templates/${template._id}`, {
          method: "DELETE"
        });
        if (!res.ok) throw new Error("Delete failed");
      }
      const remaining = templates.filter(t => t._id !== template._id);
      setTemplates(remaining);
      setSelectedTemplate(remaining.length > 0 ? remaining[0] : null);
      setActiveFieldId(null);
    } catch (e) {
      alert("Failed to delete template");
    }
  };

  // Upload Template Image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedTemplate) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append("backgroundImageFile", file);
    formData.append("conferenceId", selectedTemplate.conferenceId);
    formData.append("name", selectedTemplate.name);
    formData.append("category", selectedTemplate.category);
    formData.append("canvasWidthMm", String(selectedTemplate.canvasWidthMm));
    formData.append("canvasHeightMm", String(selectedTemplate.canvasHeightMm));
    formData.append("isDefault", String(selectedTemplate.isDefault));
    formData.append("fields", JSON.stringify(selectedTemplate.fields));
    if (selectedTemplate._id) formData.append("_id", selectedTemplate._id);

    setUploadingImage(true);
    try {
      const res = await fetch(`${API_URL}/api/badge-templates`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedTemplate(updated);
        setTemplates(prev => prev.map(t => t._id === updated._id ? updated : t));
      } else {
        alert("Failed to upload background template");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading background image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save template configuration
  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      const payload = {
        ...selectedTemplate,
        fields: JSON.stringify(selectedTemplate.fields)
      };

      const res = await fetch(`${API_URL}/api/badge-templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        setSelectedTemplate(saved);
        setTemplates(prev => {
          const exists = prev.some(t => t._id === saved._id);
          if (exists) {
            return prev.map(t => t._id === saved._id ? saved : t);
          } else {
            return [...prev, saved];
          }
        });
        alert("Template saved successfully!");
      } else {
        const err = await res.json();
        alert(`Error saving template: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save template configuration");
    } finally {
      setSaving(false);
    }
  };

  // Add Dynamic Field to Template
  const handleAddField = (type: string) => {
    if (!selectedTemplate) return;
    const defaultLabels: Record<string, string> = {
      name: "Full Name",
      photo: "Participant Photo",
      qr: "QR Code",
      regId: "Registration ID",
      category: "Category",
      designation: "Designation",
      organization: "Hospital / Org",
      city: "City",
      state: "State",
      customText: "Custom Field"
    };

    const newField: BadgeField = {
      id: `field-${type}-${Date.now()}`,
      type,
      label: defaultLabels[type] || "Dynamic Field",
      x: 10,
      y: 10,
      width: type === "qr" ? 25 : type === "photo" ? 30 : 40,
      height: type === "qr" ? 25 : type === "photo" ? 36 : 8,
      fontSize: type === "name" ? 16 : 10,
      fontWeight: type === "name" ? "bold" : "normal",
      fontStyle: "normal",
      fontFamily: "system-ui",
      color: "#000000",
      backgroundColor: "transparent",
      borderRadius: 0,
      opacity: 1,
      shadow: "none",
      alignment: type === "qr" || type === "photo" ? "center" : "left",
      rotation: 0,
      letterSpacing: "normal",
      lineHeight: "1.2",
      padding: "0px",
      photoFit: "cover",
      circular: false,
      qrErrorCorrection: "L",
      qrBgColor: "#ffffff",
      qrFgColor: "#000000"
    };

    setSelectedTemplate({
      ...selectedTemplate,
      fields: [...selectedTemplate.fields, newField]
    });
    setActiveFieldId(newField.id);
  };

  // Edit fields property
  const handleUpdateFieldProperty = (fieldId: string, prop: keyof BadgeField, value: any) => {
    if (!selectedTemplate) return;
    const updatedFields = selectedTemplate.fields.map(f => {
      if (f.id === fieldId) {
        return { ...f, [prop]: value };
      }
      return f;
    });
    setSelectedTemplate({ ...selectedTemplate, fields: updatedFields });
  };

  // Get Canvas scale multipliers (mm to pixels)
  const getCanvasScale = () => {
    if (!canvasRef.current || !selectedTemplate) return { scaleX: 1, scaleY: 1 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      scaleX: rect.width / selectedTemplate.canvasWidthMm,
      scaleY: rect.height / selectedTemplate.canvasHeightMm
    };
  };

  // Drag and Resize Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent, mode: "drag" | "resize" | "rotate", fieldId: string, handle?: string) => {
    if (previewMode) return;
    e.stopPropagation();
    e.preventDefault();
    setActiveFieldId(fieldId);
    
    if (!selectedTemplate) return;
    const field = selectedTemplate.fields.find(f => f.id === fieldId);
    if (!field) return;

    setDragMode(mode);
    setResizeHandle(handle || null);
    
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      fieldX: field.x,
      fieldY: field.y,
      fieldW: field.width,
      fieldH: field.height,
      angle: field.rotation
    };

    document.addEventListener("mousemove", handleCanvasMouseMove);
    document.addEventListener("mouseup", handleCanvasMouseUp);
  };

  const handleCanvasMouseMove = (e: MouseEvent) => {
    if (!selectedTemplate || !activeFieldId || !dragMode) return;
    const index = selectedTemplate.fields.findIndex(f => f.id === activeFieldId);
    if (index === -1) return;
    const field = selectedTemplate.fields[index];

    const { scaleX, scaleY } = getCanvasScale();
    const deltaX = (e.clientX - dragStartRef.current.x) / scaleX;
    const deltaY = (e.clientY - dragStartRef.current.y) / scaleY;

    const updatedFields = [...selectedTemplate.fields];
    let newX = field.x;
    let newY = field.y;
    let newW = field.width;
    let newH = field.height;
    let newRotation = field.rotation;

    if (dragMode === "drag") {
      newX = dragStartRef.current.fieldX + deltaX;
      newY = dragStartRef.current.fieldY + deltaY;

      // Snap to Grid
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      // Boundaries Check
      newX = Math.max(0, Math.min(selectedTemplate.canvasWidthMm - field.width, newX));
      newY = Math.max(0, Math.min(selectedTemplate.canvasHeightMm - field.height, newY));
    } 
    else if (dragMode === "resize" && resizeHandle) {
      if (resizeHandle.includes("e")) {
        newW = Math.max(5, dragStartRef.current.fieldW + deltaX);
        if (snapToGrid) newW = Math.round(newW / gridSize) * gridSize;
      }
      if (resizeHandle.includes("s")) {
        newH = Math.max(5, dragStartRef.current.fieldH + deltaY);
        if (snapToGrid) newH = Math.round(newH / gridSize) * gridSize;
      }
      if (resizeHandle.includes("w")) {
        const potentialW = dragStartRef.current.fieldW - deltaX;
        if (potentialW >= 5) {
          newW = potentialW;
          newX = dragStartRef.current.fieldX + deltaX;
          if (snapToGrid) {
            newW = Math.round(newW / gridSize) * gridSize;
            newX = Math.round(newX / gridSize) * gridSize;
          }
        }
      }
      if (resizeHandle.includes("n")) {
        const potentialH = dragStartRef.current.fieldH - deltaY;
        if (potentialH >= 5) {
          newH = potentialH;
          newY = dragStartRef.current.fieldY + deltaY;
          if (snapToGrid) {
            newH = Math.round(newH / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
          }
        }
      }
    }
    else if (dragMode === "rotate") {
      // Calculate rotation delta angle from canvas center
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const centerX = rect.left + (field.x + field.width / 2) * scaleX;
        const centerY = rect.top + (field.y + field.height / 2) * scaleY;
        const angleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        newRotation = Math.round(angleRad * (180 / Math.PI));
        if (newRotation < 0) newRotation += 360;
      }
    }

    updatedFields[index] = {
      ...field,
      x: newX,
      y: newY,
      width: newW,
      height: newH,
      rotation: newRotation
    };

    setSelectedTemplate({ ...selectedTemplate, fields: updatedFields });
  };

  const handleCanvasMouseUp = () => {
    setDragMode(null);
    setResizeHandle(null);
    document.removeEventListener("mousemove", handleCanvasMouseMove);
    document.removeEventListener("mouseup", handleCanvasMouseUp);
  };

  // Reorder Layers (send backward, bring forward)
  const handleReorderLayer = (direction: "forward" | "backward") => {
    if (!selectedTemplate || !activeFieldId) return;
    const index = selectedTemplate.fields.findIndex(f => f.id === activeFieldId);
    if (index === -1) return;

    const fieldsCopy = [...selectedTemplate.fields];
    if (direction === "forward" && index < fieldsCopy.length - 1) {
      // Swap with next index
      const temp = fieldsCopy[index];
      fieldsCopy[index] = fieldsCopy[index + 1];
      fieldsCopy[index + 1] = temp;
    } else if (direction === "backward" && index > 0) {
      // Swap with previous index
      const temp = fieldsCopy[index];
      fieldsCopy[index] = fieldsCopy[index - 1];
      fieldsCopy[index - 1] = temp;
    }

    setSelectedTemplate({ ...selectedTemplate, fields: fieldsCopy });
  };

  // Render text value for dynamic field
  const getPreviewFieldValue = (type: string, label: string) => {
    switch (type) {
      case "name": return previewParticipant.name;
      case "regId": return previewParticipant.regId;
      case "category": return previewParticipant.category;
      case "city": return previewParticipant.state;
      case "organization": return previewParticipant.dynamicData?.Organization || "HOSPITAL / ORG";
      case "designation": return previewParticipant.dynamicData?.Designation || "DESIGNATION";
      case "state": return previewParticipant.state;
      case "customText": return label;
      default: return label;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white flex-col gap-3">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading Template Editor...</p>
      </div>
    );
  }

  const activeField = selectedTemplate?.fields.find(f => f.id === activeFieldId);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      
      {/* HEADER CONTROL BAR */}
      <header className="h-16 border-b border-slate-800 bg-[#0f1420] px-6 flex items-center justify-between z-10 flex-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/admin/conference/${conferenceId}`)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-extrabold text-sm tracking-wide text-white uppercase">Visual Badge Designer</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Dynamic Template Mapping Station</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 rounded-xl p-1 text-xs">
            <button 
              onClick={() => setPreviewMode(false)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${!previewMode ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              Editor Mode
            </button>
            <button 
              onClick={() => setPreviewMode(true)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${previewMode ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              Live Preview
            </button>
          </div>

          <button 
            onClick={handleSaveTemplate}
            disabled={saving || !selectedTemplate}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
            <span>Save Configuration</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE CONTENT PANELS */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* LEFT COLUMN: TEMPLATES DIRECTORY */}
        <aside className="w-64 border-r border-slate-800 bg-[#0f131f] flex flex-col flex-none min-h-0">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-none">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Badge Templates</h3>
            <button 
              onClick={handleCreateTemplate}
              className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all active:scale-90"
              title="Create Template"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {templates.map(t => (
              <div 
                key={t._id} 
                onClick={() => { setSelectedTemplate(t); setActiveFieldId(null); }}
                className={`p-3 rounded-xl cursor-pointer transition-all border group relative ${
                  selectedTemplate?._id === t._id 
                    ? "bg-blue-600/10 border-blue-500/50 text-white font-bold" 
                    : "border-slate-800/60 bg-slate-900/35 hover:bg-slate-800/40 text-slate-300"
                }`}
              >
                <div className="truncate text-xs uppercase font-extrabold tracking-wide pr-12">{t.name}</div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{t.category}</div>
                
                {t.isDefault && (
                  <span className="inline-block text-[8px] bg-slate-800 text-blue-400 font-black tracking-widest px-1.5 py-0.5 rounded mt-2 border border-slate-700">
                    DEFAULT
                  </span>
                )}

                <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCloneTemplate(t); }}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                    title="Duplicate"
                  >
                    <Copy size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t); }}
                    className="p-1 hover:bg-slate-800 hover:text-rose-400 rounded text-slate-400"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}

            {templates.length === 0 && (
              <div className="text-center text-xs text-slate-500 mt-12 px-4">
                No templates configured. Click "+" above to start mapping.
              </div>
            )}
          </div>
        </aside>

        {/* MIDDLE COLUMN: VISUAL DESIGNER CANVAS CONTAINER */}
        <main className="flex-1 bg-[#0b0e14] flex flex-col items-center justify-center p-6 relative overflow-auto min-w-0 min-h-0 select-none">
          {selectedTemplate ? (
            <div className="flex flex-col items-center gap-4">
              
              {/* Size preset info badge */}
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold">
                <span className="text-slate-400 uppercase">Canvas Size:</span>
                <span className="text-blue-400 font-mono">{selectedTemplate.canvasWidthMm} x {selectedTemplate.canvasHeightMm} mm</span>
                
                {selectedTemplate.backgroundImage ? (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <Check size={14} /> Background Loaded
                  </span>
                ) : (
                  <span className="text-amber-500 flex items-center gap-1">
                    <AlertTriangle size={14} /> Plain White Background
                  </span>
                )}
              </div>

              {/* THE BADGE CANVAS */}
              <div 
                ref={canvasRef}
                id="badge-designer-canvas"
                className="bg-white border border-slate-700 shadow-2xl relative overflow-hidden select-none"
                style={{
                  width: `${selectedTemplate.canvasWidthMm * 4.5}px`, // 4.5px per mm scaling
                  height: `${selectedTemplate.canvasHeightMm * 4.5}px`,
                  backgroundImage: selectedTemplate.backgroundImage ? `url(${API_URL}/${selectedTemplate.backgroundImage})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxSizing: "border-box"
                }}
              >
                {/* Visual guidelines */}
                {snapToGrid && !previewMode && (
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                      backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
                      backgroundSize: `${gridSize * 4.5}px ${gridSize * 4.5}px`
                    }}
                  />
                )}

                {/* FIELDS OVERLAY LAYER */}
                {selectedTemplate.fields.map((field, idx) => {
                  const isFieldActive = activeFieldId === field.id && !previewMode;
                  const mmToPx = 4.5;
                  
                  return (
                    <div 
                      key={field.id}
                      onClick={(e) => { e.stopPropagation(); setActiveFieldId(field.id); }}
                      onMouseDown={(e) => handleCanvasMouseDown(e, "drag", field.id)}
                      className={`absolute cursor-move select-none ${
                        isFieldActive ? "ring-2 ring-blue-500 ring-offset-1 z-50 bg-blue-50/20" : ""
                      }`}
                      style={{
                        left: `${field.x * mmToPx}px`,
                        top: `${field.y * mmToPx}px`,
                        width: `${field.width * mmToPx}px`,
                        height: `${field.height * mmToPx}px`,
                        transform: `rotate(${field.rotation || 0}deg)`,
                        transformOrigin: "center center",
                        boxSizing: "border-box",
                        zIndex: idx + 5
                      }}
                    >
                      {/* Drag & Resize handles */}
                      {isFieldActive && (
                        <>
                          {/* NW handle */}
                          <div 
                            onMouseDown={(e) => handleCanvasMouseDown(e, "resize", field.id, "nw")}
                            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-600 rounded-full cursor-nwse-resize z-50" 
                          />
                          {/* NE handle */}
                          <div 
                            onMouseDown={(e) => handleCanvasMouseDown(e, "resize", field.id, "ne")}
                            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-600 rounded-full cursor-nesw-resize z-50" 
                          />
                          {/* SE handle */}
                          <div 
                            onMouseDown={(e) => handleCanvasMouseDown(e, "resize", field.id, "se")}
                            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-600 rounded-full cursor-nwse-resize z-50" 
                          />
                          {/* SW handle */}
                          <div 
                            onMouseDown={(e) => handleCanvasMouseDown(e, "resize", field.id, "sw")}
                            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-600 rounded-full cursor-nesw-resize z-50" 
                          />
                          {/* Rotate lever */}
                          <div 
                            onMouseDown={(e) => handleCanvasMouseDown(e, "rotate", field.id)}
                            className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border border-blue-600 rounded-full cursor-pointer flex items-center justify-center z-50 shadow-sm"
                            title="Drag to Rotate"
                          >
                            <RefreshCw size={8} className="text-blue-600" />
                          </div>
                        </>
                      )}

                      {/* FIELD CONTENT RENDERING */}
                      <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{
                        backgroundColor: field.backgroundColor,
                        borderRadius: `${field.borderRadius}px`,
                        opacity: field.opacity,
                        boxShadow: field.shadow,
                        padding: field.padding
                      }}>
                        {field.type === "qr" ? (
                          <div className="p-0.5 bg-white border rounded" style={{
                            backgroundColor: field.qrBgColor,
                            borderColor: field.color + "25",
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxSizing: "border-box"
                          }}>
                            <QRCode 
                              value={previewParticipant.regId} 
                              size={256}
                              fgColor={field.qrFgColor}
                              bgColor={field.qrBgColor}
                              level={field.qrErrorCorrection as any}
                              style={{ width: "100%", height: "100%" }}
                            />
                          </div>
                        ) : field.type === "photo" ? (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 border border-slate-200" style={{
                            borderRadius: field.circular ? "50%" : "3px"
                          }}>
                            <img 
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" 
                              alt="Profile"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: field.photoFit as any,
                                borderRadius: field.circular ? "50%" : "3px"
                              }}
                            />
                          </div>
                        ) : (
                          <span style={{
                            fontSize: `${field.fontSize}px`,
                            fontWeight: field.fontWeight as any,
                            fontStyle: field.fontStyle,
                            fontFamily: field.fontFamily,
                            color: field.color,
                            textAlign: field.alignment as any,
                            letterSpacing: field.letterSpacing,
                            lineHeight: field.lineHeight,
                            width: "100%",
                            textTransform: "uppercase",
                            whiteSpace: "normal",
                            wordBreak: "break-word"
                          }}>
                            {getPreviewFieldValue(field.type, field.label)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Keyboard movements indicator bar */}
              {!previewMode && (
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex gap-4">
                  <span>🖱️ Drag to Position / Resize</span>
                  <span>⌨️ Arrows to nudge (Shift = micro nudge)</span>
                  <span>📋 Del key to delete element</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center bg-[#0f1320]/30 border border-slate-800 p-12 rounded-3xl max-w-sm">
              <ImageIcon size={48} className="text-slate-600 mx-auto mb-4" />
              <h2 className="font-bold text-sm uppercase tracking-wide">No Template Selected</h2>
              <p className="text-xs text-slate-400 mt-2">Select an existing template from the left directory or click "+" to build a custom category card.</p>
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: PROPERTY PANEL & FIELDS TOOLBOX */}
        <aside className="w-80 border-l border-slate-800 bg-[#0f131f] flex flex-col flex-none min-h-0 overflow-y-auto">
          {selectedTemplate ? (
            <div className="flex flex-col h-full">
              
              {/* SECTION A: TEMPLATE SETTINGS */}
              <div className="p-4 border-b border-slate-800 space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Template Settings</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Template Name</label>
                    <input 
                      type="text"
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 font-bold text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Target Category</label>
                      <select 
                        value={selectedTemplate.category}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, category: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none text-xs font-bold text-white cursor-pointer"
                      >
                        <option value="Default">Default Template</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Size Layout</label>
                      <select 
                        value={`${selectedTemplate.canvasWidthMm}x${selectedTemplate.canvasHeightMm}`}
                        onChange={(e) => {
                          const [w, h] = e.target.value.split("x").map(Number);
                          setSelectedTemplate({ ...selectedTemplate, canvasWidthMm: w, canvasHeightMm: h });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none text-xs font-bold text-white cursor-pointer"
                      >
                        {BADGE_PRESETS.map(p => (
                          <option key={p.name} value={`${p.width}x${p.height}`}>{p.name.split(" ")[0]} ({p.width}x{p.height}mm)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Image Background Upload */}
                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Background Template Image</label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl cursor-pointer border border-slate-700 transition-all select-none">
                        {uploadingImage ? <RefreshCw className="animate-spin" size={14} /> : <Upload size={14} />}
                        <span>Upload JPG/PNG</span>
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg" 
                          onChange={handleImageUpload} 
                          className="hidden" 
                        />
                      </label>

                      {selectedTemplate.backgroundImage && (
                        <button 
                          onClick={() => setSelectedTemplate({ ...selectedTemplate, backgroundImage: "" })}
                          className="p-2.5 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 rounded-xl border border-rose-900/35 transition-colors"
                          title="Remove Background"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Set default template checkbox */}
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer pt-1 select-none">
                    <input 
                      type="checkbox"
                      checked={selectedTemplate.isDefault}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, isDefault: e.target.checked })}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                    <span>Is Default Template</span>
                  </label>
                </div>
              </div>

              {/* SECTION B: FIELDS TOOLBOX */}
              {!activeField && !previewMode && (
                <div className="p-4 border-b border-slate-800 space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Fields</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {FIELD_TYPES.map(f => (
                      <button 
                        key={f.type}
                        onClick={() => handleAddField(f.type)}
                        className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 p-2.5 rounded-xl text-left text-xs font-bold transition-all hover:border-slate-700 active:scale-[0.97]"
                      >
                        {f.icon}
                        <span className="truncate">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION C: COMPONENT PROPERTIES PANEL */}
              {activeField && !previewMode && (
                <div className="p-4 space-y-4 flex-1">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Properties: {activeField.label}</span>
                    <button 
                      onClick={() => setActiveFieldId(null)}
                      className="text-[10px] text-slate-400 hover:text-white uppercase font-bold"
                    >
                      Deselect
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Layer arrangement buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleReorderLayer("forward")}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                      >
                        <Layers size={10} /> Bring Forward
                      </button>
                      <button 
                        onClick={() => handleReorderLayer("backward")}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                      >
                        <Layers size={10} /> Send Backward
                      </button>
                    </div>

                    {/* Dimensions numeric boxes */}
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-1">X (mm)</label>
                        <input 
                          type="number"
                          value={Math.round(activeField.x)}
                          onChange={(e) => handleUpdateFieldProperty(activeField.id, "x", Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs font-mono font-bold text-center text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-1">Y (mm)</label>
                        <input 
                          type="number"
                          value={Math.round(activeField.y)}
                          onChange={(e) => handleUpdateFieldProperty(activeField.id, "y", Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs font-mono font-bold text-center text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-1">W (mm)</label>
                        <input 
                          type="number"
                          value={Math.round(activeField.width)}
                          onChange={(e) => handleUpdateFieldProperty(activeField.id, "width", Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs font-mono font-bold text-center text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-1">H (mm)</label>
                        <input 
                          type="number"
                          value={Math.round(activeField.height)}
                          onChange={(e) => handleUpdateFieldProperty(activeField.id, "height", Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs font-mono font-bold text-center text-white"
                        />
                      </div>
                    </div>

                    {/* CUSTOM FIELD LABEL (only for custom text types) */}
                    {activeField.type === "customText" && (
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Custom Text Display</label>
                        <input 
                          type="text"
                          value={activeField.label}
                          onChange={(e) => handleUpdateFieldProperty(activeField.id, "label", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 p-2 rounded-xl outline-none text-xs font-bold text-white"
                        />
                      </div>
                    )}

                    {/* TEXT SPECIFIC OPTIONS */}
                    {activeField.type !== "photo" && activeField.type !== "qr" && (
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Font Family</label>
                            <select 
                              value={activeField.fontFamily}
                              onChange={(e) => handleUpdateFieldProperty(activeField.id, "fontFamily", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs font-bold text-white"
                            >
                              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Text Color</label>
                            <input 
                              type="color"
                              value={activeField.color}
                              onChange={(e) => handleUpdateFieldProperty(activeField.id, "color", e.target.value)}
                              className="w-full h-8 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer p-0.5"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Font Size</label>
                            <input 
                              type="range"
                              min="6"
                              max="48"
                              value={activeField.fontSize}
                              onChange={(e) => handleUpdateFieldProperty(activeField.id, "fontSize", Number(e.target.value))}
                              className="w-full accent-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Alignment</label>
                            <div className="flex bg-slate-900 rounded-lg p-0.5 text-[10px] font-bold">
                              {["left", "center", "right"].map(align => (
                                <button 
                                  key={align}
                                  onClick={() => handleUpdateFieldProperty(activeField.id, "alignment", align)}
                                  className={`flex-1 py-1 rounded capitalize ${activeField.alignment === align ? "bg-blue-600 text-white font-black" : "text-slate-400"}`}
                                >
                                  {align}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 text-xs text-slate-300 font-bold cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={activeField.fontWeight === "bold"}
                              onChange={(e) => handleUpdateFieldProperty(activeField.id, "fontWeight", e.target.checked ? "bold" : "normal")}
                              className="rounded bg-slate-900 border-slate-850 text-blue-500"
                            />
                            <span>Bold</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-xs text-slate-300 font-bold cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={activeField.fontStyle === "italic"}
                              onChange={(e) => handleUpdateFieldProperty(activeField.id, "fontStyle", e.target.checked ? "italic" : "normal")}
                              className="rounded bg-slate-900 border-slate-850 text-blue-500"
                            />
                            <span>Italic</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* PHOTO SPECIFIC OPTIONS */}
                    {activeField.type === "photo" && (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Image Fitting Option</label>
                          <select 
                            value={activeField.photoFit}
                            onChange={(e) => handleUpdateFieldProperty(activeField.id, "photoFit", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-bold text-white cursor-pointer"
                          >
                            <option value="cover">Crop & Fill (Cover)</option>
                            <option value="contain">Fit Entire Image (Contain)</option>
                            <option value="fill">Stretch to bounds (Fill)</option>
                          </select>
                        </div>

                        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={activeField.circular}
                            onChange={(e) => handleUpdateFieldProperty(activeField.id, "circular", e.target.checked)}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Circular Portrait Frame</span>
                        </label>
                      </div>
                    )}

                    {/* QR SPECIFIC OPTIONS */}
                    {activeField.type === "qr" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">QR Fg Color</label>
                            <input 
                              type="color"
                              value={activeField.qrFgColor}
                              onChange={(e) => handleUpdateFieldProperty(activeField.id, "qrFgColor", e.target.value)}
                              className="w-full h-8 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer p-0.5"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">QR Bg Color</label>
                            <input 
                              type="color"
                              value={activeField.qrBgColor}
                              onChange={(e) => handleUpdateFieldProperty(activeField.id, "qrBgColor", e.target.value)}
                              className="w-full h-8 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer p-0.5"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Error Correction Level</label>
                          <select 
                            value={activeField.qrErrorCorrection}
                            onChange={(e) => handleUpdateFieldProperty(activeField.id, "qrErrorCorrection", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-bold text-white cursor-pointer"
                          >
                            <option value="L">L (Low - 7%)</option>
                            <option value="M">M (Medium - 15%)</option>
                            <option value="Q">Q (Quarter - 25%)</option>
                            <option value="H">H (High - 30%)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* GENERAL TRANSFORM SETTINGS (Rotation, Opacity) */}
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase mb-1">
                          <span>Rotation Angle</span>
                          <span className="font-mono text-blue-400">{activeField.rotation || 0}°</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="360"
                          value={activeField.rotation || 0}
                          onChange={(e) => handleUpdateFieldProperty(activeField.id, "rotation", Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase mb-1">
                          <span>Element Opacity</span>
                          <span className="font-mono text-blue-400">{Math.round(activeField.opacity * 100)}%</span>
                        </div>
                        <input 
                          type="range"
                          min="10"
                          max="100"
                          value={activeField.opacity * 100}
                          onChange={(e) => handleUpdateFieldProperty(activeField.id, "opacity", Number(e.target.value) / 100)}
                          className="w-full accent-blue-500"
                        />
                      </div>
                    </div>

                    {/* Delete field block */}
                    <div className="pt-4 border-t border-slate-800">
                      <button 
                        onClick={() => {
                          const updatedFields = selectedTemplate.fields.filter(f => f.id !== activeFieldId);
                          setSelectedTemplate({ ...selectedTemplate, fields: updatedFields });
                          setActiveFieldId(null);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 font-bold text-xs py-3 px-4 rounded-xl border border-rose-900/35 transition-all"
                      >
                        <Trash2 size={14} />
                        <span>Delete Element</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
              No template active.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
