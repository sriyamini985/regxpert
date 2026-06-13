import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { useAuth } from "../../../contexts/AuthContext";
import LoadingBar from "../../../components/ui/LoadingBar";
import { ArrowLeft } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

interface PrintLog {
  timestamp: string;
  staffMember: string;
}

interface Participant {
  _id: string;
  name: string;
  regId?: string;
  phone?: string;
  email?: string;
  state?: string;
  category?: string;
  printed: boolean;
  printLogs?: PrintLog[];
  qrCode?: string;
  isCheckedIn?: boolean;
  blockKitbag?: boolean;
  blockCertificate?: boolean;
  blockDay1Breakfast?: boolean;
  blockDay1Lunch?: boolean;
  blockDay1Dinner?: boolean;
  blockDay2Breakfast?: boolean;
  blockDay2Lunch?: boolean;
  blockDay2Dinner?: boolean;
  blockDay3Breakfast?: boolean;
  blockDay3Lunch?: boolean;
  blockDay3Dinner?: boolean;
  blockDay4Breakfast?: boolean;
  blockDay4Lunch?: boolean;
  blockDay4Dinner?: boolean;
  blockDay5Breakfast?: boolean;
  blockDay5Lunch?: boolean;
  blockDay5Dinner?: boolean;
  blockWorkshop1?: boolean;
  blockWorkshop2?: boolean;
  blockWorkshop3?: boolean;
  blockWorkshop4?: boolean;
  blockWorkshop5?: boolean;
  dynamicData?: Record<string, any>;
  workshopScans?: string[];
}

const ALL_CHECKPOINT_OPTIONS = ["Check-In", "Food Counter", "Kitbag", "Certificate", "Workshop"];

const BadgePrint = () => {
  const navigate = useNavigate();
  const { conferenceSlug } = useParams<{ conferenceSlug: string }>();
  const { user } = useAuth();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Selection state
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Editable badge fields
  const [editName, setEditName] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editState, setEditState] = useState("");
  const [selectedCheckpoints, setSelectedCheckpoints] = useState<string[]>([]);

  // Load all participants for conference on mount
  useEffect(() => {
    loadParticipants();
  }, [conferenceSlug]);

  const loadParticipants = async () => {
    if (!conferenceSlug) return;
    try {
      setFetching(true);
      const res = await fetch(`${API}/api/participants/conference/${conferenceSlug}`);
      const data = await res.json();
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load participants", err);
    } finally {
      setFetching(false);
    }
  };

  // Determine eligible checkpoints from participant record
  const getAssignedCheckpoints = (p: Participant): string[] => {
    const list: string[] = [];
    if (p.isCheckedIn) list.push("Check-In");
    if (!p.blockKitbag) list.push("Kitbag");
    if (!p.blockCertificate) list.push("Certificate");

    const hasFoodAccess = ![
      p.blockDay1Breakfast, p.blockDay1Lunch, p.blockDay1Dinner,
      p.blockDay2Breakfast, p.blockDay2Lunch, p.blockDay2Dinner,
      p.blockDay3Breakfast, p.blockDay3Lunch, p.blockDay3Dinner,
      p.blockDay4Breakfast, p.blockDay4Lunch, p.blockDay4Dinner,
      p.blockDay5Breakfast, p.blockDay5Lunch, p.blockDay5Dinner
    ].every(Boolean);
    if (hasFoodAccess) list.push("Food Counter");

    const hasWorkshopAccess = ![
      p.blockWorkshop1, p.blockWorkshop2, p.blockWorkshop3,
      p.blockWorkshop4, p.blockWorkshop5
    ].every(Boolean);
    if (hasWorkshopAccess) list.push("Workshop");

    return list;
  };

  // When selected participant changes, update editor states
  useEffect(() => {
    if (selectedParticipant) {
      setEditName(selectedParticipant.name || "");
      setEditDestination(
        selectedParticipant.dynamicData?.Destination || 
        selectedParticipant.category || 
        ""
      );
      setEditState(
        selectedParticipant.state || 
        selectedParticipant.dynamicData?.City || 
        ""
      );
      setSelectedCheckpoints(getAssignedCheckpoints(selectedParticipant));
    } else {
      setEditName("");
      setEditDestination("");
      setEditState("");
      setSelectedCheckpoints([]);
    }
  }, [selectedParticipant]);

  const toggleCheckpoint = (cp: string) => {
    if (selectedCheckpoints.includes(cp)) {
      setSelectedCheckpoints(selectedCheckpoints.filter(item => item !== cp));
    } else {
      setSelectedCheckpoints([...selectedCheckpoints, cp]);
    }
  };

  // Filter list
  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.regId && p.regId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePrintBadge = async () => {
    if (!selectedParticipant) return;

    // Check duplicate warning
    if (selectedParticipant.printed) {
      const confirmPrint = window.confirm(
        `⚠️ WARNING: A badge for ${selectedParticipant.name} has already been printed.\nAre you sure you want to print a duplicate badge?`
      );
      if (!confirmPrint) return;
    }

    setUpdating(true);
    try {
      const staffEmail = user?.email || "Staff Operator";
      const newLog: PrintLog = {
        timestamp: new Date().toISOString(),
        staffMember: staffEmail
      };

      const existingLogs = selectedParticipant.printLogs || [];
      const updatedLogs = [...existingLogs, newLog];

      // Update backend database with printed status and audit log
      const res = await fetch(`${API}/api/participants/${selectedParticipant._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printed: true,
          printLogs: updatedLogs
        }),
      });

      if (!res.ok) {
        throw new Error("Server failed to update print status");
      }

      // Update local state instantly
      const updatedList = participants.map((p) => {
        if (p._id === selectedParticipant._id) {
          return { ...p, printed: true, printLogs: updatedLogs };
        }
        return p;
      });
      setParticipants(updatedList);
      setSelectedParticipant({
        ...selectedParticipant,
        printed: true,
        printLogs: updatedLogs
      });

      // Open Print window with encoded customized data in the exact order:
      // Name, Destination, City/State, QR Code, Registration ID, Selected Checkpoints
      const payload = {
        name: editName,
        destination: editDestination,
        state: editState,
        regId: selectedParticipant.regId || selectedParticipant._id,
        qrCode: selectedParticipant.qrCode || selectedParticipant.regId || selectedParticipant._id,
        checkpoints: selectedCheckpoints
      };

      window.open(`/print-qr?data=${encodeURIComponent(JSON.stringify(payload))}`, "_blank");

    } catch (err) {
      console.error(err);
      alert("Failed to record print status in database.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F4F7FB] p-6 md:p-12 font-sans text-slate-800">
      <LoadingBar isLoading={fetching || updating} />
      
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* HEADER BAR */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/u/${conferenceSlug}`)}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition text-slate-600 flex items-center justify-center border border-slate-200/60 shadow-sm"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Badge Printing Station</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Configure layout, verify print logs, and print event ID cards.</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Operator Connected
          </div>
        </div>

        {/* MAIN SPLIT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: SEARCH & ROSTER (Col span 5) */}
          <div className="lg:col-span-5 bg-white rounded-[2.5rem] shadow-sm p-6 border border-slate-200 flex flex-col h-[700px]">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Roster List</span>
              <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100">
                {filtered.length} Delegates
              </span>
            </h2>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or registration ID..."
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-4 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all text-sm"
            />

            <div className="flex-grow overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
              {filtered.map((p) => {
                const isSelected = selectedParticipant?._id === p._id;
                return (
                  <div
                    key={p._id}
                    onClick={() => setSelectedParticipant(p)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center select-none ${
                      p.printed 
                        ? isSelected 
                          ? "bg-emerald-50 border-emerald-400 shadow-sm"
                          : "bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50/80"
                        : isSelected
                          ? "bg-blue-50/50 border-blue-400 shadow-sm"
                          : "bg-white border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 text-sm truncate">{p.name}</p>
                      <p className="text-xs font-medium text-slate-400 mt-0.5 truncate">
                        ID: {p.regId || "N/A"} • {p.category || "No Category"}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 ml-4">
                      {p.printed ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black border border-emerald-200 tracking-wide uppercase">
                          Printed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black border border-slate-200 tracking-wide uppercase">
                          Not Printed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center text-slate-400 font-medium text-sm mt-12">No participants match your query.</div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: EDITOR & LIVE PREVIEW (Col span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {selectedParticipant ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* COLUMN 1: CONFIGURATION & LOGS */}
                <div className="bg-white rounded-[2.5rem] shadow-sm p-6 border border-slate-200 flex flex-col justify-between min-h-[500px]">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-5">Badge Options</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-800"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Destination / Title</label>
                        <input
                          type="text"
                          value={editDestination}
                          onChange={(e) => setEditDestination(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">City / State</label>
                        <input
                          type="text"
                          value={editState}
                          onChange={(e) => setEditState(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-800"
                        />
                      </div>

                      {/* CHECKPOINTS */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Print Checkpoints</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {ALL_CHECKPOINT_OPTIONS.map((cp) => (
                            <label key={cp} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-lg cursor-pointer transition select-none text-xs">
                              <input
                                type="checkbox"
                                checked={selectedCheckpoints.includes(cp)}
                                onChange={() => toggleCheckpoint(cp)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="font-bold text-slate-700">{cp}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PRINT LOG AUDIT */}
                  <div className="border-t border-slate-100 pt-4 mt-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Print Activity Logs</h3>
                    <div className="max-h-[100px] overflow-y-auto space-y-1.5 text-[10px] text-slate-500 font-medium pr-1">
                      {selectedParticipant.printLogs && selectedParticipant.printLogs.length > 0 ? (
                        selectedParticipant.printLogs.map((log, index) => (
                          <div key={index} className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span>By: {log.staffMember}</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 italic">No print activity logs on file. Ready for initial print.</div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handlePrintBadge}
                    className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition shadow-lg shadow-blue-500/10 active:scale-[0.98]"
                  >
                    🖨️ Generate &amp; Print Badge
                  </button>
                </div>

                {/* COLUMN 2: LIVE PRINT PREVIEW */}
                <div className="bg-white rounded-[2.5rem] shadow-sm p-6 border border-slate-200 flex flex-col items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 w-full text-left mb-4">Badge Preview</h2>
                  
                  {/* PREVIEW CONTAINER: CR80 portrait aspect ratio (approx 5:8 scale) */}
                  <div className="w-[240px] h-[380px] bg-white border border-slate-300 rounded-2xl shadow-lg p-5 flex flex-col justify-between items-center text-center relative overflow-hidden font-sans border-t-[8px] border-t-blue-600">
                    
                    {/* 1. Name */}
                    <div className="w-full mt-2">
                      <h3 className="text-lg font-extrabold text-slate-900 leading-tight truncate px-1">
                        {editName || "PARTICIPANT NAME"}
                      </h3>
                    </div>

                    {/* 2. Destination */}
                    <div className="w-full">
                      <p className="text-[11px] font-black text-slate-500 tracking-wide uppercase truncate px-1">
                        {editDestination || "DESTINATION / CATEGORY"}
                      </p>
                    </div>

                    {/* 3. City / State */}
                    <div className="w-full">
                      <p className="text-[10px] font-bold text-slate-400 truncate px-1">
                        {editState || "CITY, STATE"}
                      </p>
                    </div>

                    {/* 4. QR Code */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-inner flex items-center justify-center">
                      <QRCode
                        value={selectedParticipant.regId || selectedParticipant._id}
                        size={110}
                      />
                    </div>

                    {/* 5. Registration ID */}
                    <div className="w-full">
                      <p className="text-[10px] font-mono font-bold text-slate-600 tracking-wider">
                        {selectedParticipant.regId || "REG-ID-MOCK"}
                      </p>
                    </div>

                    {/* 6. Assigned Checkpoints */}
                    <div className="w-full mb-2">
                      <div className="flex flex-wrap gap-1 justify-center max-h-[50px] overflow-hidden">
                        {selectedCheckpoints.map((cp) => (
                          <span key={cp} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[8px] font-black uppercase">
                            {cp}
                          </span>
                        ))}
                        {selectedCheckpoints.length === 0 && (
                          <span className="text-[8px] text-slate-300 font-bold italic">No Checkpoints</span>
                        )}
                      </div>
                    </div>

                  </div>

                  <p className="text-xs text-slate-400 font-medium text-center mt-4 px-4">
                    Rendered in CR80 Portrait format (3.375" x 2.125").
                  </p>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] shadow-sm p-12 border border-slate-200 flex flex-col items-center justify-center text-center h-[500px]">
                <span className="text-5xl mb-4">🖨️</span>
                <h2 className="text-xl font-bold text-slate-900">Select a Delegate</h2>
                <p className="text-slate-400 text-sm mt-1 max-w-sm">
                  Search and select a participant on the left to configure checkpoints and preview their printed badge.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default BadgePrint;
