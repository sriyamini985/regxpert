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
  conferenceName?: string;
}

const ALL_CHECKPOINT_OPTIONS = ["Check-In", "Food Counter", "Kitbag", "Certificate", "Workshop", "QR Code"];

const getCategoryColor = (category: string) => {
  const cat = String(category).toLowerCase();
  if (cat.includes("faculty") || cat.includes("speaker") || cat.includes("presenter") || cat.includes("guest")) {
    return "#312e81"; // Premium Indigo color scheme
  }
  if (cat.includes("organizer") || cat.includes("staff") || cat.includes("admin")) {
    return "#064e3b";
  }
  if (cat.includes("exhibitor") || cat.includes("sponsor")) {
    return "#854d0e";
  }
  if (cat.includes("volunteer")) {
    return "#991b1b";
  }
  return "#1e3a8a"; // Navy for delegates
};

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Editable badge fields
  const [editName, setEditName] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editState, setEditState] = useState("");
  const [selectedCheckpoints, setSelectedCheckpoints] = useState<string[]>([]);
  const [badgeSize, setBadgeSize] = useState<string>("standard");
  const [printPhoto, setPrintPhoto] = useState<boolean>(true);
  const [printName, setPrintName] = useState<boolean>(true);
  const [printQR, setPrintQR] = useState<boolean>(true);
  const [printRegId, setPrintRegId] = useState<boolean>(true);

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
      setSelectedIds([]);
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

    list.push("QR Code"); // QR Code is present by default
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

  // Roster multi-select handlers
  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(p => p._id));
    }
  };

  const handleSelectNotPrinted = () => {
    const notPrinted = filtered.filter(p => !p.printed).map(p => p._id);
    setSelectedIds(notPrinted);
  };

  // Filter list
  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.regId && p.regId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Individual Print Action
  const handlePrintBadge = async () => {
    if (!selectedParticipant) return;

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

      // Format QR Code value:
      // Name, Registration ID, Category, Event Name, Assigned Checkpoints, Attendance Status
      const checkpointsStr = selectedCheckpoints.filter(cp => cp !== "QR Code").join(", ");
      const qrContent = `Name: ${editName}\nReg ID: ${selectedParticipant.regId || selectedParticipant._id}\nCategory: ${editDestination || "Delegate"}\nEvent: ${selectedParticipant.conferenceName || "Event"}\nCheckpoints: ${checkpointsStr || "None"}\nStatus: ${selectedParticipant.isCheckedIn ? "Checked In" : "Registered"}`;

      // Open Print window with encoded customized data
      const payload = {
        name: editName,
        destination: editDestination,
        state: editState,
        regId: selectedParticipant.regId || selectedParticipant._id,
        qrCode: qrContent, // Formatted text block
        checkpoints: selectedCheckpoints,
        backUrl: `/u/${conferenceSlug}/badge-print`,
        conferenceName: selectedParticipant.conferenceName || "",
        dynamicData: selectedParticipant.dynamicData || {},
        badgeSize: badgeSize,
        printPhoto: printPhoto,
        printName: printName,
        printQR: printQR,
        printRegId: printRegId
      };

      sessionStorage.setItem("print_badge_data", JSON.stringify(payload));
      window.open("/print-qr", "_self");

    } catch (err) {
      console.error(err);
      alert("Failed to record print status in database.");
    } finally {
      setUpdating(false);
    }
  };

  // Bulk Print Action
  const handleBulkPrint = async () => {
    if (selectedIds.length === 0) return alert("Please select at least one delegate to print.");
    
    const confirmPrint = window.confirm(`Are you sure you want to print ${selectedIds.length} badges in bulk?`);
    if (!confirmPrint) return;

    setUpdating(true);
    try {
      const staffEmail = user?.email || "Staff Operator";
      const timestamp = new Date().toISOString();

      // Prepare updates for database
      const updatePromises = selectedIds.map(async (id) => {
        const participant = participants.find(p => p._id === id);
        if (!participant) return;

        const existingLogs = participant.printLogs || [];
        const newLog = { timestamp, staffMember: staffEmail };
        const updatedLogs = [...existingLogs, newLog];

        return fetch(`${API}/api/participants/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            printed: true,
            printLogs: updatedLogs
          }),
        }).then(res => res.json());
      });

      await Promise.all(updatePromises);

      // Reload local participants list
      await loadParticipants();
      
      // Open Print window with encoded customized data for all selected badges
      const selectedParticipants = participants.filter(p => selectedIds.includes(p._id));
      const badgesPayload = selectedParticipants.map(p => {
        const assignments = getAssignedCheckpoints(p);
        const nameVal = p.name;
        const destVal = p.dynamicData?.Destination || p.category || "";
        const stateVal = p.state || p.dynamicData?.City || "";
        const regIdVal = p.regId || p._id;
        
        // Format QR Code value: Name, Registration ID, Category, Event Name, Assigned Checkpoints, Attendance Status
        const checkpointsStr = assignments.filter(cp => cp !== "QR Code").join(", ");
        const qrContent = `Name: ${nameVal}\nReg ID: ${regIdVal}\nCategory: ${destVal || "Delegate"}\nEvent: ${p.conferenceName || "Event"}\nCheckpoints: ${checkpointsStr || "None"}\nStatus: ${p.isCheckedIn ? "Checked In" : "Registered"}`;

        return {
          name: nameVal,
          destination: destVal,
          state: stateVal,
          regId: regIdVal,
          qrCode: qrContent, // Send full formatted details text block
          checkpoints: assignments,
          conferenceName: p.conferenceName || "",
          dynamicData: p.dynamicData || {},
          printPhoto: printPhoto,
          printName: printName,
          printQR: printQR,
          printRegId: printRegId
        };
      });

      const payload = {
        badges: badgesPayload,
        backUrl: `/u/${conferenceSlug}/badge-print`,
        badgeSize: badgeSize
      };

      sessionStorage.setItem("print_badge_data", JSON.stringify(payload));
      window.open("/print-qr", "_self");

    } catch (err) {
      console.error(err);
      alert("Failed to run bulk printing updates.");
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

            {/* Bulk Selection Actions bar */}
            <div className="flex flex-wrap gap-2 mb-3 items-center">
              <button 
                onClick={handleSelectAll} 
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold border border-slate-200"
              >
                {selectedIds.length === filtered.length ? "Deselect All" : "Select All"}
              </button>
              <button 
                onClick={handleSelectNotPrinted} 
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold border border-slate-200"
              >
                Select Not Printed
              </button>
              {selectedIds.length > 0 && (
                <button 
                  onClick={handleBulkPrint}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm ml-auto animate-fade-in"
                >
                  🖨️ Bulk Print Selected ({selectedIds.length})
                </button>
              )}
            </div>

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
                const isChecked = selectedIds.includes(p._id);
                return (
                  <div
                    key={p._id}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center select-none ${
                      p.printed 
                        ? isSelected 
                          ? "bg-emerald-50 border-emerald-400 shadow-sm"
                          : "bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50/80"
                        : isSelected
                          ? "bg-blue-50/50 border-blue-400 shadow-sm"
                          : "bg-white border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    {/* Roster multi-select checkbox */}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(p._id);
                      }}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer mr-3"
                    />

                    <div className="min-w-0 flex-1" onClick={() => setSelectedParticipant(p)}>
                      <p className="font-bold text-slate-800 text-sm truncate">{p.name}</p>
                      <p className="text-xs font-medium text-slate-400 mt-0.5 truncate">
                        ID: {p.regId || "N/A"} • {p.category || "No Category"}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 ml-4" onClick={() => setSelectedParticipant(p)}>
                      {p.printed ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black border border-emerald-200 tracking-wide uppercase">
                          Printed ({p.printLogs?.length || 1})
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
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category Ribbon</label>
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

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Badge Print Size</label>
                        <select
                          value={badgeSize}
                          onChange={(e) => setBadgeSize(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-800"
                        >
                          <option value="standard">Standard Card (CR80)</option>
                          <option value="A5">A5 Size Badge</option>
                        </select>
                      </div>

                      {/* BADGE FIELDS TO PRINT */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Badge Fields to Print</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-lg cursor-pointer transition select-none text-xs">
                            <input
                              type="checkbox"
                              checked={printPhoto}
                              onChange={(e) => setPrintPhoto(e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="font-bold text-slate-700">Photo / Image</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-lg cursor-pointer transition select-none text-xs">
                            <input
                              type="checkbox"
                              checked={printName}
                              onChange={(e) => setPrintName(e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="font-bold text-slate-700">Full Name</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-lg cursor-pointer transition select-none text-xs">
                            <input
                              type="checkbox"
                              checked={printQR}
                              onChange={(e) => setPrintQR(e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="font-bold text-slate-700">QR Code</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-lg cursor-pointer transition select-none text-xs">
                            <input
                              type="checkbox"
                              checked={printRegId}
                              onChange={(e) => setPrintRegId(e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="font-bold text-slate-700">Registration ID</span>
                          </label>
                        </div>
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
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Print Activity Logs ({selectedParticipant.printLogs?.length || 0})
                    </h3>
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
                  
                  {/* PREVIEW CONTAINER: CR80 portrait aspect ratio vs A5 aspect ratio */}
                  {(() => {
                    const themeColor = getCategoryColor(editDestination);
                    return (
                      <div 
                        className={`h-[380px] bg-white border border-slate-300 rounded-2xl shadow-lg flex flex-col items-center text-center relative overflow-hidden font-sans transition-all duration-300 justify-center ${
                          badgeSize === "A5" ? "w-[268px] gap-3" : "w-[240px] gap-1.5"
                        }`}
                      >
                        {/* B. Center Attendee Details */}
                        <div className="flex-none flex flex-col items-center justify-center w-full px-4 box-border gap-1">
                          
                          {/* Photo Placeholder */}
                          {printPhoto && (
                            <div className={`bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden mb-1 shadow-inner transition-all duration-300 relative ${
                              badgeSize === "A5" ? "w-[150px] h-[180px]" : "w-[90px] h-[108px]"
                            }`} style={{ padding: "1.5px" }}>
                              {/* Viewfinder Corner Accents */}
                              <div className="absolute top-0 left-0 border-t-[1.5px] border-l-[1.5px] transition-all" style={{ width: badgeSize === "A5" ? "12px" : "6px", height: badgeSize === "A5" ? "12px" : "6px", borderColor: themeColor }} />
                              <div className="absolute top-0 right-0 border-t-[1.5px] border-r-[1.5px] transition-all" style={{ width: badgeSize === "A5" ? "12px" : "6px", height: badgeSize === "A5" ? "12px" : "6px", borderColor: themeColor }} />
                              <div className="absolute bottom-0 left-0 border-b-[1.5px] border-l-[1.5px] transition-all" style={{ width: badgeSize === "A5" ? "12px" : "6px", height: badgeSize === "A5" ? "12px" : "6px", borderColor: themeColor }} />
                              <div className="absolute bottom-0 right-0 border-b-[1.5px] border-r-[1.5px] transition-all" style={{ width: badgeSize === "A5" ? "12px" : "6px", height: badgeSize === "A5" ? "12px" : "6px", borderColor: themeColor }} />
                              
                              {selectedParticipant.dynamicData?.Photo || selectedParticipant.dynamicData?.Avatar ? (
                                <img 
                                  src={selectedParticipant.dynamicData.Photo || selectedParticipant.dynamicData.Avatar} 
                                  alt="Delegate" 
                                  className="w-full h-full object-cover rounded-[3px]" 
                                />
                              ) : (
                                <svg className={`${badgeSize === "A5" ? "w-12 h-12" : "w-9 h-9"} text-slate-300`} fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0 1 12.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                                </svg>
                              )}
                            </div>
                          )}

                          {/* 1. Name */}
                          {printName && (
                            <h3 className={`font-extrabold text-slate-900 leading-tight uppercase line-clamp-2 px-1 transition-all duration-300 ${
                              badgeSize === "A5" ? "text-lg" : "text-sm"
                            }`}>
                              {editName || "PARTICIPANT NAME"}
                            </h3>
                          )}

                          {/* Category Pill Tag */}
                          {editDestination && (
                            <div 
                              className="inline-flex items-center justify-center font-extrabold uppercase tracking-wide select-none transition-all duration-300"
                              style={{
                                marginTop: badgeSize === "A5" ? "6px" : "2px",
                                padding: badgeSize === "A5" ? "4px 12px" : "1px 6px",
                                backgroundColor: `${themeColor}15`,
                                border: `0.5px solid ${themeColor}50`,
                                borderRadius: "100px",
                                fontSize: badgeSize === "A5" ? "10px" : "6px",
                                color: themeColor
                              }}
                            >
                              {editDestination}
                            </div>
                          )}

                          {/* 2. Designation / Org Suffix */}
                          {selectedParticipant.dynamicData?.Organization && (
                            <p className={`font-semibold text-slate-500 uppercase truncate max-w-full transition-all duration-300 ${
                              badgeSize === "A5" ? "text-[11px]" : "text-[8px]"
                            }`} style={{ marginTop: badgeSize === "A5" ? "4px" : "2px" }}>
                              {selectedParticipant.dynamicData.Organization}
                            </p>
                          )}
                        </div>

                        {/* Decorative Divider */}
                        <div 
                          className="transition-all duration-300"
                          style={{
                            width: badgeSize === "A5" ? "210px" : "160px",
                            height: "1px",
                            background: "linear-gradient(to right, transparent, #e2e8f0, transparent)",
                            marginTop: badgeSize === "A5" ? "6px" : "2px",
                            marginBottom: badgeSize === "A5" ? "6px" : "2px"
                          }}
                        />

                        {/* C. QR Code Section */}
                        {(printQR || printRegId) && (
                          <div className="flex flex-col items-center justify-center pb-2 box-border">
                            {printQR && selectedCheckpoints.includes("QR Code") && (
                              <div 
                                className="bg-white p-1 rounded-xl shadow-inner flex items-center justify-center mb-1 transition-all duration-300"
                                style={{
                                  border: `1px solid ${themeColor}30`,
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                                }}
                              >
                                <QRCode
                                  value={selectedParticipant.regId || selectedParticipant._id}
                                  size={badgeSize === "A5" ? 55 : 45}
                                />
                              </div>
                            )}
                            
                            {/* Registration ID */}
                            {printRegId && (
                              <div 
                                className="flex items-center gap-1 mt-0.5 justify-center transition-all duration-300"
                              >
                                <span style={{ fontSize: badgeSize === "A5" ? "12px" : "8px", fontWeight: 950, color: themeColor }}>#</span>
                                <p className={`font-mono font-bold text-slate-800 tracking-wider leading-none transition-all duration-300 ${
                                  badgeSize === "A5" ? "text-[12px]" : "text-[9px]"
                                }`}>
                                  {selectedParticipant.regId || selectedParticipant._id}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })()}

                  <p className="text-xs text-slate-400 font-medium text-center mt-4 px-4">
                    Rendered in {badgeSize === "A5" ? "A5 Portrait format (148mm x 210mm)" : "CR80 Portrait format (3.375\" x 2.125\")"}.
                  </p>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] shadow-sm p-12 border border-slate-200 flex flex-col items-center justify-center text-center h-[700px]">
                <span className="text-5xl mb-4">🖨️</span>
                <h2 className="text-xl font-bold text-slate-900">Select a Delegate</h2>
                <p className="text-slate-400 text-sm mt-1 max-w-sm">
                  Search and select a participant on the left, or use the multi-select checkboxes to print multiple badges in a single bulk process.
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
