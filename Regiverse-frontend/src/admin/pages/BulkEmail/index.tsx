import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { 
  Mail, 
  QrCode, 
  Send, 
  RefreshCw, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  ShieldCheck, 
  Info, 
  X,
  Play,
  RotateCcw
} from "lucide-react";
import { API_URL } from "../../../config/api";
import { socket } from "../../../services/socketService";

interface QRStats {
  totalRegistered: number;
  qrReady: number;
  alreadySent: number;
  pending: number;
  failed: number;
  noEmail: number;
}

interface ActivityLog {
  recipient: string;
  email: string;
  status: "sent" | "failed" | "queued";
  reason?: string;
  messageId?: string;
  time?: string;
}

interface TestDiagnostic {
  success: boolean;
  providerAttempted?: string;
  httpStatus?: number;
  errorCode?: string;
  failureReason?: string;
  messageId?: string;
  recipient?: string;
  rawResponse?: string;
}

const BulkEmail = () => {
  const { conferenceId } = useParams<{ conferenceId: string }>();

  // Modes: "qr_pass" | "general"
  const [mode, setMode] = useState<"qr_pass" | "general">("qr_pass");

  // Participants & Data
  const [participants, setParticipants] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [conferenceName, setConferenceName] = useState("Dasara Navaratri 2026");
  const [totalDays, setTotalDays] = useState(9);

  // QR Pass Stats
  const [qrStats, setQrStats] = useState<QRStats>({
    totalRegistered: 0,
    qrReady: 0,
    alreadySent: 0,
    pending: 0,
    failed: 0,
    noEmail: 0,
  });

  // Category Filtering & Selection
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [participantSearch, setParticipantSearch] = useState("");

  // General Email Form
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  // Campaign State
  const [campaignRunning, setCampaignRunning] = useState(false);
  const [forceResend, setForceResend] = useState(false);
  const [campaignProgress, setCampaignProgress] = useState<{
    total: number;
    current: number;
    sent: number;
    failed: number;
    remaining: number;
    percent: number;
    status: string;
  } | null>(null);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);

  // Modals
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("sriyamini659@gmail.com");
  const [testSending, setTestSending] = useState(false);
  const [testDiagnostic, setTestDiagnostic] = useState<TestDiagnostic | null>(null);

  // Auth Header helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  /* ==========================================================
     FETCH PARTICIPANTS & QR STATS
     ========================================================== */
  const fetchParticipants = useCallback(() => {
    if (!conferenceId) return;
    setFetching(true);

    fetch(`${API_URL}/api/participants/conference/${conferenceId}?admin=true`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setParticipants(list);
      })
      .catch((err) => console.error("Error fetching participants:", err))
      .finally(() => setFetching(false));
  }, [conferenceId]);

  const fetchQRStats = useCallback(() => {
    if (!conferenceId) return;

    fetch(`${API_URL}/api/bulk-email/${conferenceId}/qr-stats`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setQrStats(data.stats);
          if (data.conference?.name) setConferenceName(data.conference.name);
          if (data.conference?.totalDays) setTotalDays(data.conference.totalDays);
        }
      })
      .catch((err) => console.error("Error fetching QR stats:", err));
  }, [conferenceId]);

  const checkCampaignStatus = useCallback(() => {
    if (!conferenceId) return;

    fetch(`${API_URL}/api/bulk-email/${conferenceId}/campaign-status`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.active && data.campaign) {
          setCampaignRunning(true);
          const c = data.campaign;
          const percent = c.total > 0 ? Math.round((c.current / c.total) * 100) : 0;
          setCampaignProgress({
            total: c.total,
            current: c.current,
            sent: c.sent,
            failed: c.failed,
            remaining: c.remaining,
            percent,
            status: c.status,
          });
          if (c.recentLogs && c.recentLogs.length > 0) {
            setRecentLogs(c.recentLogs);
          }
        }
      })
      .catch(() => {});
  }, [conferenceId]);

  useEffect(() => {
    fetchParticipants();
    fetchQRStats();
    checkCampaignStatus();
  }, [fetchParticipants, fetchQRStats, checkCampaignStatus]);

  /* ==========================================================
     SOCKET LISTENERS FOR REAL-TIME CAMPAIGN PROGRESS
     ========================================================== */
  useEffect(() => {
    const handleProgress = (data: any) => {
      setCampaignRunning(true);
      const percent = data.total > 0 ? Math.round((data.current / data.total) * 100) : 0;
      setCampaignProgress({
        total: data.total,
        current: data.current,
        sent: data.sent,
        failed: data.failed,
        remaining: data.remaining,
        percent,
        status: data.status || "running",
      });

      if (data.lastRecipient) {
        setRecentLogs((prev) => [
          {
            recipient: data.lastRecipient,
            email: data.lastEmail,
            status: data.lastStatus,
            reason: data.lastReason,
            time: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 49),
        ]);
      }
    };

    const handleCompleted = (data: any) => {
      setCampaignRunning(false);
      setCampaignProgress({
        total: data.total,
        current: data.total,
        sent: data.sent,
        failed: data.failed,
        remaining: 0,
        percent: 100,
        status: "completed",
      });
      fetchQRStats();
      fetchParticipants();
    };

    socket.on("email-campaign-progress", handleProgress);
    socket.on("email-campaign-completed", handleCompleted);

    return () => {
      socket.off("email-campaign-progress", handleProgress);
      socket.off("email-campaign-completed", handleCompleted);
    };
  }, [fetchQRStats, fetchParticipants]);

  /* ==========================================================
     CATEGORY FILTERING & SELECTION LOGIC
     ========================================================== */
  const getParticipantCategory = (p: any) => {
    return p.category && p.category.trim() !== "" ? p.category : "Uncategorized";
  };

  const dbCategories = Array.from(new Set(participants.map((p) => getParticipantCategory(p))));
  const allCategoriesList = [...dbCategories, "Workshop Attendees"];

  useEffect(() => {
    if (participants.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(allCategoriesList);
    }
  }, [participants]);

  const filteredParticipants = participants.filter((p: any) => {
    const cat = getParticipantCategory(p);
    const categoryMatch = selectedCategories.includes(cat);
    const isWorkshopAttendee = p.workshopScans && p.workshopScans.length > 0;
    const workshopMatch = selectedCategories.includes("Workshop Attendees") && isWorkshopAttendee;

    if (!categoryMatch && !workshopMatch) return false;

    if (participantSearch.trim()) {
      const q = participantSearch.toLowerCase();
      const matchName = (p.name || "").toLowerCase().includes(q);
      const matchEmail = (p.email || "").toLowerCase().includes(q);
      const matchReg = (p.regId || "").toLowerCase().includes(q);
      return matchName || matchEmail || matchReg;
    }

    return true;
  });

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const toggleSelectAllParticipants = () => {
    if (selectedParticipantIds.length === filteredParticipants.length) {
      setSelectedParticipantIds([]);
    } else {
      setSelectedParticipantIds(filteredParticipants.map((p) => p._id));
    }
  };

  const toggleParticipantSelect = (id: string) => {
    if (selectedParticipantIds.includes(id)) {
      setSelectedParticipantIds(selectedParticipantIds.filter((pid) => pid !== id));
    } else {
      setSelectedParticipantIds([...selectedParticipantIds, id]);
    }
  };

  /* ==========================================================
     ACTION: SEND QR PASSES (ALL / SELECTED / FAILED)
     ========================================================== */
  const triggerSendQREmails = async (options: {
    participantIds?: string[];
    resendFailedOnly?: boolean;
    forceResend?: boolean;
  }) => {
    if (!conferenceId) return;

    const countTarget = options.participantIds?.length
      ? `${options.participantIds.length} selected participant(s)`
      : options.resendFailedOnly
      ? `${qrStats.failed} failed participant(s)`
      : options.forceResend
      ? `ALL ${qrStats.totalRegistered} participants (including already sent)`
      : `${qrStats.pending} pending participant(s)`;

    const confirmMsg = `Are you sure you want to trigger QR Pass dispatch to ${countTarget}?`;
    if (!window.confirm(confirmMsg)) return;

    setCampaignRunning(true);
    setCampaignProgress({
      total: options.participantIds?.length || (options.resendFailedOnly ? qrStats.failed : qrStats.pending),
      current: 0,
      sent: 0,
      failed: 0,
      remaining: options.participantIds?.length || (options.resendFailedOnly ? qrStats.failed : qrStats.pending),
      percent: 0,
      status: "queued",
    });

    try {
      const res = await fetch(`${API_URL}/api/bulk-email/${conferenceId}/send-qr-emails`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          participantIds: options.participantIds,
          resendFailedOnly: options.resendFailedOnly,
          forceResend: options.forceResend,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`❌ Error starting campaign: ${data.message || "Request failed"}`);
        setCampaignRunning(false);
        return;
      }

      if (data.queued) {
        // Queued in background
        setCampaignProgress((prev) => (prev ? { ...prev, status: "running" } : null));
      } else {
        // Immediate small batch completion
        setCampaignRunning(false);
        setCampaignProgress({
          total: data.total || 0,
          current: data.total || 0,
          sent: data.sent || 0,
          failed: data.failed || 0,
          remaining: 0,
          percent: 100,
          status: "completed",
        });
        if (data.logs) {
          setRecentLogs(data.logs);
        }
        fetchQRStats();
        fetchParticipants();
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
      setCampaignRunning(false);
    }
  };

  /* ==========================================================
     ACTION: SEND TEST EMAIL (DIAGNOSTICS)
     ========================================================== */
  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes("@")) {
      alert("Please enter a valid test recipient email address.");
      return;
    }

    setTestSending(true);
    setTestDiagnostic(null);

    try {
      const res = await fetch(`${API_URL}/api/bulk-email/${conferenceId}/test-email`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          testEmail: testEmailAddress.trim(),
        }),
      });

      const data = await res.json();
      setTestDiagnostic({
        success: data.success,
        providerAttempted: data.diagnostic?.providerAttempted || "Brevo / Resend",
        httpStatus: data.diagnostic?.httpStatus || res.status,
        errorCode: data.diagnostic?.errorCode || (data.success ? "None" : "AUTH_FAILED"),
        failureReason: data.diagnostic?.failureReason || data.message || "",
        messageId: data.diagnostic?.messageId || "",
        recipient: data.diagnostic?.recipient || testEmailAddress,
        rawResponse: JSON.stringify(data.diagnostic?.rawResponse || data, null, 2),
      });

      if (data.success) {
        fetchQRStats();
      }
    } catch (err: any) {
      setTestDiagnostic({
        success: false,
        failureReason: `Network error: ${err.message}`,
        httpStatus: 0,
        errorCode: "NETWORK_ERROR",
      });
    } finally {
      setTestSending(false);
    }
  };

  /* ==========================================================
     ACTION: FETCH PREVIEW EMAIL TEMPLATE
     ========================================================== */
  const handleOpenPreview = async () => {
    setShowPreviewModal(true);
    setLoadingPreview(true);
    try {
      const res = await fetch(`${API_URL}/api/bulk-email/${conferenceId}/preview-qr-email`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && data.html) {
        setPreviewHtml(data.html);
      } else {
        setPreviewHtml("<div style='padding:20px;'>Failed to load preview.</div>");
      }
    } catch (err) {
      setPreviewHtml("<div style='padding:20px; color:red;'>Failed to load preview.</div>");
    } finally {
      setLoadingPreview(false);
    }
  };

  /* ==========================================================
     ACTION: SEND GENERAL BROADCAST EMAIL
     ========================================================== */
  const handleSendGeneralEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      alert("Please provide an email subject and body message.");
      return;
    }
    if (filteredParticipants.length === 0) {
      alert("No recipients match the selected criteria.");
      return;
    }

    setCampaignRunning(true);
    try {
      const participantIds = filteredParticipants.map((p) => p._id);
      const res = await fetch(`${API_URL}/api/bulk-email/${conferenceId}/send-emails`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subject,
          message,
          bannerImage,
          participantIds,
        }),
      });

      const data = await res.json();
      alert(`Campaign Result:\nSent: ${data.sent || 0}\nFailed: ${data.failed || 0}`);
      fetchParticipants();
    } catch (err: any) {
      alert(`Failed to send emails: ${err.message}`);
    } finally {
      setCampaignRunning(false);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F8FAFC] p-4 sm:p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER & MODE SWITCHER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Bulk Email &amp; QR Pass Engine
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                  {totalDays}-Day Ready
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Unified participant communication and daily QR pass dispatch for {conferenceName}
              </p>
            </div>
          </div>

          {/* MODE TOGGLE PILLS */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1.5 border border-slate-200 self-stretch md:self-auto">
            <button
              onClick={() => setMode("qr_pass")}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === "qr_pass"
                  ? "bg-white text-orange-600 shadow-md shadow-slate-200 border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Event QR Pass Mode</span>
            </button>
            <button
              onClick={() => setMode("general")}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === "general"
                  ? "bg-white text-blue-600 shadow-md shadow-slate-200 border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>General Campaign</span>
            </button>
          </div>
        </div>

        {/* ==========================================================
           MODE 1: EVENT QR PASS MODE (DASARA NAVARATRI 9-DAY)
           ========================================================== */}
        {mode === "qr_pass" && (
          <div className="space-y-6">

            {/* PRE-SEND METRICS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Total Registered */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Registered</span>
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {qrStats.totalRegistered}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 mt-1">All participants</div>
              </div>

              {/* QR Code Ready */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-emerald-600 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">QR Ready</span>
                  <QrCode className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  {qrStats.qrReady}
                </div>
                <div className="text-[11px] font-semibold text-emerald-600/70 mt-1">Passes generated</div>
              </div>

              {/* Already Sent */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-blue-600 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Already Sent</span>
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                  {qrStats.alreadySent}
                </div>
                <div className="text-[11px] font-semibold text-blue-600/70 mt-1">Delivered to inbox</div>
              </div>

              {/* Pending */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-amber-600 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                  {qrStats.pending}
                </div>
                <div className="text-[11px] font-semibold text-amber-600/70 mt-1">Ready for dispatch</div>
              </div>

              {/* Failed */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-rose-600 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Failed</span>
                  <XCircle className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
                  {qrStats.failed}
                </div>
                <div className="text-[11px] font-semibold text-rose-600/70 mt-1">Needs resend</div>
              </div>
            </div>

            {/* ACTION TOOLBAR & CONTROLS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">QR Dispatch Controls</h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Trigger background delivery, test system health, or preview the official 9-day entry pass.
                  </p>
                </div>

                {/* Secondary utilities: Preview & Test Email */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                  <button
                    onClick={handleOpenPreview}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200"
                  >
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span>Preview Email</span>
                  </button>

                  <button
                    onClick={() => {
                      setTestDiagnostic(null);
                      setShowTestModal(true);
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all border border-indigo-200"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Send Test Email</span>
                  </button>
                </div>
              </div>

              {/* PRIMARY ACTION BUTTONS */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Send To All */}
                <div className="space-y-2">
                  <button
                    onClick={() => triggerSendQREmails({ forceResend })}
                    disabled={campaignRunning || (qrStats.pending === 0 && !forceResend)}
                    className={`w-full flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl font-extrabold text-sm sm:text-base text-white transition-all shadow-lg active:scale-[0.98] ${
                      campaignRunning || (qrStats.pending === 0 && !forceResend)
                        ? "bg-slate-300 shadow-none cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/25"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    <span>SEND QR TO ALL MEMBERS</span>
                  </button>
                  <label className="flex items-center gap-2 px-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={forceResend}
                      onChange={(e) => setForceResend(e.target.checked)}
                      className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                    />
                    <span className="text-[11px] font-medium text-slate-500">
                      Include already sent (Force Overwrite)
                    </span>
                  </label>
                </div>

                {/* 2. Send Selected */}
                <div>
                  <button
                    onClick={() => triggerSendQREmails({ participantIds: selectedParticipantIds })}
                    disabled={campaignRunning || selectedParticipantIds.length === 0}
                    className={`w-full flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl font-extrabold text-sm sm:text-base text-white transition-all shadow-lg active:scale-[0.98] ${
                      campaignRunning || selectedParticipantIds.length === 0
                        ? "bg-slate-300 shadow-none cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25"
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>Send Selected ({selectedParticipantIds.length})</span>
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2 px-1">
                    Select delegates below in Audience Roster
                  </p>
                </div>

                {/* 3. Resend Failed */}
                <div>
                  <button
                    onClick={() => triggerSendQREmails({ resendFailedOnly: true })}
                    disabled={campaignRunning || qrStats.failed === 0}
                    className={`w-full flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl font-extrabold text-sm sm:text-base text-white transition-all shadow-lg active:scale-[0.98] ${
                      campaignRunning || qrStats.failed === 0
                        ? "bg-slate-300 shadow-none cursor-not-allowed"
                        : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/25"
                    }`}
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Resend Failed ({qrStats.failed})</span>
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2 px-1">
                    Retries participants whose delivery failed
                  </p>
                </div>
              </div>
            </div>

            {/* LIVE CAMPAIGN PROGRESS BAR (when running or just completed) */}
            {campaignProgress && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {campaignProgress.status === "running" ? (
                      <span className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    )}
                    <span className="font-bold text-slate-800 text-sm">
                      {campaignProgress.status === "running"
                        ? "Transmission Queue Active..."
                        : campaignProgress.status === "queued"
                        ? "Queue Initialized in Background"
                        : "Campaign Batch Completed"}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-600">
                    {campaignProgress.current} / {campaignProgress.total} Processed ({campaignProgress.percent}%)
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(4, campaignProgress.percent)}%` }}
                  />
                </div>

                {/* Sub counters */}
                <div className="flex items-center gap-6 text-xs font-semibold text-slate-500 pt-1">
                  <span className="text-emerald-600">✓ Sent: {campaignProgress.sent}</span>
                  <span className="text-rose-600">✕ Failed: {campaignProgress.failed}</span>
                  <span>⏳ Remaining: {campaignProgress.remaining}</span>
                </div>
              </div>
            )}

            {/* SPLIT SECTION: ROSTER & REAL-TIME ACTIVITY LOGS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* TARGET AUDIENCE & ROSTER (Col span 2) */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Delegate Audience Roster</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Filter and check participants to target specific recipients.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSelectAllParticipants}
                      className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
                    >
                      {selectedParticipantIds.length === filteredParticipants.length
                        ? "Deselect All"
                        : `Select All (${filteredParticipants.length})`}
                    </button>
                  </div>
                </div>

                {/* Category Pills Filter */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {allCategoriesList.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    const count = participants.filter((p) => {
                      if (cat === "Workshop Attendees") {
                        return p.workshopScans && p.workshopScans.length > 0;
                      }
                      return getParticipantCategory(p) === cat;
                    }).length;

                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${
                          isSelected
                            ? "bg-orange-50 border-orange-200 text-orange-700 shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-white/80 rounded-md font-black">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <input
                  type="text"
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  placeholder="Filter by name, email, or Reg ID..."
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium mb-4 outline-none focus:ring-2 focus:ring-orange-400 text-slate-800"
                />

                {/* Delegates List */}
                <div className="flex-1 max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {fetching ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-bold animate-pulse">
                      Loading participant database...
                    </div>
                  ) : filteredParticipants.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-medium">
                      No participants match the selected filter criteria.
                    </div>
                  ) : (
                    filteredParticipants.map((p) => {
                      const isSelected = selectedParticipantIds.includes(p._id);
                      return (
                        <div
                          key={p._id}
                          onClick={() => toggleParticipantSelect(p._id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-orange-50/60 border-orange-300"
                              : "bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/60"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by parent div
                              className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs truncate">{p.name}</p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {p.email || "⚠️ Missing Email"} · <span className="font-mono text-slate-600">{p.regId || p._id}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold bg-white border border-slate-200 text-slate-600 capitalize">
                              {getParticipantCategory(p)}
                            </span>
                            {p.qrEmailSent ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-lg font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Sent
                              </span>
                            ) : p.qrEmailFailedAt ? (
                              <span 
                                title={p.qrEmailFailureReason || "Failed"}
                                className="text-[10px] px-2 py-0.5 rounded-lg font-black bg-rose-100 text-rose-800 border border-rose-200"
                              >
                                Failed
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold bg-slate-200 text-slate-600">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* REAL-TIME ACTIVITY LOGS (Col span 1) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col h-[520px]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Live Dispatch Activity</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Recent {recentLogs.length} events</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {recentLogs.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 text-xs">
                      No recent activity. Click a dispatch button to start delivery.
                    </div>
                  ) : (
                    recentLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                          log.status === "sent"
                            ? "bg-emerald-50/50 border-emerald-200/60"
                            : "bg-rose-50/50 border-rose-200/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 truncate">{log.recipient}</span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                              log.status === "sent"
                                ? "bg-emerald-200/80 text-emerald-800"
                                : "bg-rose-200/80 text-rose-800"
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{log.email}</div>
                        {log.reason && (
                          <div className="text-[10px] text-rose-600 font-medium truncate" title={log.reason}>
                            ⚠️ {log.reason}
                          </div>
                        )}
                        {log.time && (
                          <div className="text-[9px] text-slate-400">{log.time}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==========================================================
           MODE 2: GENERAL CAMPAIGN MODE
           ========================================================== */}
        {mode === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Compose Broadcast Message</h2>
                <p className="text-slate-500 text-xs mt-0.5">Send custom announcements to delegates.</p>
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Campaign Banner Image</label>
                {bannerImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={bannerImage} alt="Banner" className="w-full h-40 object-cover" />
                    <button
                      onClick={() => setBannerImage(null)}
                      className="absolute top-3 right-3 p-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition">
                    <span className="text-2xl mb-1">🖼️</span>
                    <span className="text-xs font-bold text-slate-700">Add Campaign Banner</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, or JPEG (Max 2MB)</span>
                    <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Subject */}
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email Subject Line (e.g., Important update regarding Dasara Navaratri)"
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />

              {/* Message Body */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose announcement body here..."
                rows={8}
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-800"
              />

              <button
                onClick={handleSendGeneralEmail}
                disabled={campaignRunning || !subject.trim() || !message.trim()}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-blue-500/20 disabled:bg-slate-300 disabled:shadow-none"
              >
                {campaignRunning ? "Transmitting..." : `Broadcast to ${filteredParticipants.length} Recipients`}
              </button>
            </div>

            {/* Target audience selection in general mode */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Target Audience</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {allCategoriesList.map((cat) => (
                  <label key={cat} className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-100 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-bold text-slate-700 flex-1">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ==========================================================
         MODAL 1: EMAIL PREVIEW MODAL
         ========================================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Email Template Preview</h3>
                <p className="text-xs text-slate-400">Sample rendering of the 9-Day Dasara Navaratri Entry Pass</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
              {loadingPreview ? (
                <div className="text-center py-20 text-slate-400 text-xs font-bold animate-pulse">
                  Rendering preview template...
                </div>
              ) : (
                <div
                  className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
         MODAL 2: SEND TEST EMAIL WITH LIVE DIAGNOSTICS
         ========================================================== */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">System Test &amp; Diagnostic</h3>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Send 1 real test email to verify Brevo credentials, SMTP relay handshake, and QR rendering.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Recipient Test Email</label>
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <button
              onClick={handleSendTestEmail}
              disabled={testSending}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 disabled:bg-slate-300 transition"
            >
              {testSending ? "Transmitting & Testing API..." : "Send Test Email"}
            </button>

            {/* Diagnostic Card */}
            {testDiagnostic && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                  testDiagnostic.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {testDiagnostic.success ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Transmission Successful!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Delivery Failed — Diagnostic Details:</span>
                    </>
                  )}
                </div>

                <div className="space-y-1 text-[11px] font-mono bg-white/70 p-2.5 rounded-xl border border-black/5">
                  <div><strong>HTTP Status:</strong> {testDiagnostic.httpStatus}</div>
                  <div><strong>Error Code:</strong> {testDiagnostic.errorCode}</div>
                  <div><strong>Recipient:</strong> {testDiagnostic.recipient}</div>
                  {testDiagnostic.messageId && (
                    <div><strong>Message ID:</strong> {testDiagnostic.messageId}</div>
                  )}
                  {testDiagnostic.failureReason && (
                    <div className="text-rose-700"><strong>Failure Reason:</strong> {testDiagnostic.failureReason}</div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BulkEmail;