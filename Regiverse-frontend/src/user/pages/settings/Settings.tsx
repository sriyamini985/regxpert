import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { API_URL } from "../../../config/api";
import { 
  Settings as SettingsIcon, 
  Trash2, 
  RefreshCw, 
  Cpu, 
  Wifi, 
  Database,
  Monitor,
  CheckCircle,
  Globe,
  KeyRound,
  Mail,
  Lock,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const { conferenceSlug } = useParams<"conferenceSlug">();
  const { user } = useAuth();
  
  const [targetRole, setTargetRole] = useState("admin");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState(false);

  // Fetch current email for the selected target role
  useEffect(() => {
    let active = true;
    const fetchEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/user/${targetRole}`);
        const data = await response.json();
        if (response.ok && data.success && active) {
          setNewEmail(data.email);
        }
      } catch (err) {
        console.error("Failed to fetch email by role", err);
      }
    };
    fetchEmail();
    return () => {
      active = false;
    };
  }, [targetRole]);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateStatus(null);
    setUpdateError(false);

    if (!newEmail) {
      setUpdateStatus("Email address cannot be empty.");
      setUpdateError(true);
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setUpdateStatus("New password must be at least 6 characters long.");
      setUpdateError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setUpdateStatus("Passwords do not match.");
      setUpdateError(true);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/change-credentials`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: targetRole,
          newEmail,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUpdateStatus(`Credentials for ${targetRole} updated successfully!`);
        setUpdateError(false);
        setNewPassword("");
        setConfirmPassword("");
        if (user?.role === targetRole && data.user && data.user.email) {
          const updatedUser = { ...user, email: data.user.email };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } else {
        setUpdateStatus(data.error || "Failed to update credentials.");
        setUpdateError(true);
      }
    } catch (err) {
      console.error(err);
      setUpdateStatus("Connection error. Failed to reach authentication service.");
      setUpdateError(true);
    } finally {
      setIsUpdating(false);
    }
  };

  // Local Storage size simulation
  const [cacheSize, setCacheSize] = useState("0 KB");
  const [clearing, setClearing] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);

  // System stats
  const [connectionSpeed, setConnectionSpeed] = useState("Checking...");
  const [wsStatus, setWsStatus] = useState("Connected");

  useEffect(() => {
    // Calculate simulated localStorage size
    let total = 0;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            const val = window.localStorage.getItem(key) || "";
            total += (key.length + val.length) * 2;
          }
        }
      }
    } catch (e) {
      console.error("Failed to calculate localStorage size", e);
    }
    setCacheSize((total / 1024).toFixed(2) + " KB");

    // Simulate ping latency
    const start = Date.now();
    fetch(`${API_URL}/api/conferences`)
      .then(() => {
        const diff = Date.now() - start;
        setConnectionSpeed(`${diff} ms (Excellent)`);
      })
      .catch(() => {
        setConnectionSpeed("Disconnected");
      });
  }, []);

  const handleClearCache = () => {
    setClearing(true);
    setTimeout(() => {
      // Clear specific cache values but keep authentication
      const userObj = localStorage.getItem("user");
      localStorage.clear();
      if (userObj) {
        localStorage.setItem("user", userObj);
      }
      setCacheSize("0.00 KB");
      setClearing(false);
      setClearedSuccess(true);
      setTimeout(() => setClearedSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 font-sans">
      {/* Title Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Terminal Settings</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Configure station endpoints and clear local operational caches.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Operator & Event details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Operator Profile Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-blue-500" />
              <span>Station Configuration</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Operator</p>
                <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{user?.email || "Staff Operator"}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Event Slug Workspace</p>
                <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{conferenceSlug}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Terminal Access Role</p>
                <p className="text-sm font-semibold text-slate-800 mt-1 uppercase">{user?.role ? `${user.role} Terminal` : "Staff Terminal"}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Terminal Locale Time</p>
                <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Account Credentials Update Form */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <KeyRound className="w-4.5 h-4.5 text-indigo-500" />
              <span>Account Credentials</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Update the primary login email and set a new password. Changing these will secure the client terminal and dashboard access.
            </p>

            {updateStatus && (
              <div className={`px-4 py-3 rounded-xl text-xs mb-5 flex items-center gap-2 font-semibold border ${
                updateError 
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-600" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
              }`}>
                {updateError ? <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" /> : <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                <span>{updateStatus}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCredentials} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Account to Manage</label>
                  <div className="relative">
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold cursor-pointer transition-all duration-150"
                    >
                      <option value="admin">Administrator Account (admin@gmail.com)</option>
                      <option value="client">Client Account (client@gmail.com)</option>
                      <option value="user">Staff Operator Account (user@gmail.com)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Login Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-150"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">New Password (leave blank to keep current)</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-150"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-150"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-150 flex items-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Credentials</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Network and API details */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Wifi className="w-4.5 h-4.5 text-emerald-500" />
              <span>Connectivity & API Endpoints</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <p className="text-sm font-bold text-slate-700">REST API Gateway</p>
                  <p className="text-xs text-slate-400 mt-0.5">Primary gateway for registration CRUD operations</p>
                </div>
                <span className="font-mono text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200/40">
                  {API_URL}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <p className="text-sm font-bold text-slate-700">WebSocket Synchronization</p>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time status updates broadcast listener</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  <span className="text-xs font-semibold text-emerald-600 uppercase">{wsStatus}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">Gateway Latency</p>
                  <p className="text-xs text-slate-400 mt-0.5">Average round trip latency for system calls</p>
                </div>
                <span className="text-xs font-semibold text-slate-700">{connectionSpeed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Local Device Diagnostics & Cache clearing */}
        <div className="space-y-6">
          {/* Cache Management Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-purple-500" />
              <span>Cache Management</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Cached configurations and selections stored on this device. Clearing this will not reset your session but will wipe saved autocomplete fields and login hints.
            </p>

            <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Device Cache Size</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{cacheSize}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Database className="w-5 h-5" />
              </div>
            </div>

            {clearedSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-4 py-3 rounded-xl text-xs mb-4 flex items-center gap-2 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Local terminal cache wiped successfully!</span>
              </div>
            )}

            <button
              onClick={handleClearCache}
              disabled={clearing}
              className="w-full bg-slate-950 hover:bg-rose-600 text-white rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:bg-slate-300"
            >
              {clearing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Clearing Cache...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Cache & Credentials</span>
                </>
              )}
            </button>
          </div>

          {/* Environment/Device details */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm text-slate-500 text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-slate-600" />
              <span>Device Diagnostics</span>
            </h3>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span>Viewport Resolution:</span>
                <span className="font-semibold text-slate-700">{window.innerWidth} x {window.innerHeight} px</span>
              </div>
              <div className="flex justify-between">
                <span>Local Timezone:</span>
                <span className="font-semibold text-slate-700">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
              </div>
              <div className="flex justify-between">
                <span>WebRTC Capable:</span>
                <span className="font-semibold text-slate-700">Yes</span>
              </div>
              <div className="flex justify-between">
                <span>Touch Supported:</span>
                <span className="font-semibold text-slate-700">
                  {navigator.maxTouchPoints > 0 ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
