import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Lock, Eye, EyeOff, Check, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Flow State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Input Focus Refs
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Load Remembered Credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("adminRememberedEmail");
    const savedPassword = localStorage.getItem("adminRememberedPassword");
    const savedRememberMe = localStorage.getItem("adminRememberMe") === "true";

    if (savedRememberMe) {
      if (savedEmail) setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // Autofocus email input on load
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Client Side validation of email format
  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordInputRef.current?.focus();
    }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const submit = async () => {
    setLoginError(null);
    if (!email) {
      setLoginError("Please enter your email address.");
      return;
    }
    if (!validateEmail(email)) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setLoginError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password, "admin");
      if (res.success) {
        // Save to remember me if checked
        if (rememberMe) {
          localStorage.setItem("adminRememberedEmail", email);
          localStorage.setItem("adminRememberedPassword", password);
          localStorage.setItem("adminRememberMe", "true");
        } else {
          localStorage.removeItem("adminRememberedEmail");
          localStorage.removeItem("adminRememberedPassword");
          localStorage.setItem("adminRememberMe", "false");
        }
        
        // Redirect dynamically based on the authenticated user's role
        if (res.user?.role === "admin") {
          navigate("/admin/conferences");
        } else if (res.user?.role === "user") {
          navigate("/user-login");
        } else {
          navigate("/");
        }
      } else {
        setLoginError(res.error || "Invalid Credentials");
        setLoading(false);
      }
    } catch (err: any) {
      setLoginError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !validateEmail(forgotEmail)) {
      alert("Please enter a valid email address");
      return;
    }
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
      {/* Background blobs for premium glass look */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10 transition-all duration-300">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <img
            src="/assets/images/regiverse-logo-new.png"
            alt="RegXperts Logo"
            className="w-16 h-16 object-contain mx-auto mb-4"
          />
          <h2 className="text-3xl font-black bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent tracking-tight">
            RegXperts
          </h2>
          <p className="text-slate-400 text-sm mt-1">Administrator Control Center</p>
        </div>

        {/* Global Error Notice */}
        {loginError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <span className="font-semibold text-rose-400">⚠️</span>
            <span>{loginError}</span>
          </div>
        )}

        {/* Unified Login Form Container */}
        <div className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                placeholder="admin@gmail.com"
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                ref={passwordInputRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handlePasswordKeyDown}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl pl-11 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <label className="relative flex items-center cursor-pointer select-none text-slate-300 text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-5 h-5 bg-slate-950 border border-slate-800 rounded-md mr-2.5 peer-checked:bg-indigo-600 peer-checked:border-transparent flex items-center justify-center transition-all duration-150">
                <Check className="w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform duration-150" />
              </div>
              <span>Remember this console login</span>
            </label>
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 hover:shadow-indigo-500/20 disabled:bg-indigo-800 disabled:shadow-none hover:-translate-y-0.5 disabled:translate-y-0 active:translate-y-0 transition-all duration-150"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </div>
      </div>

      {/* Forgot Password Modal (Simulated) */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowForgotModal(false);
                setForgotSuccess(false);
                setForgotEmail("");
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-850 rounded-2xl max-w-sm w-full p-6 relative z-10 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
              
              {forgotSuccess ? (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-3 rounded-xl text-sm">
                    A secure password reset link has been dispatched to <strong className="text-white">{forgotEmail}</strong>.
                  </div>
                  <button
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSuccess(false);
                      setForgotEmail("");
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Provide the email associated with your administrator account to retrieve a password recovery link.
                  </p>
                  <div>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@gmail.com"
                      required
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(false);
                        setForgotEmail("");
                      }}
                      className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-2.5 text-sm font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:bg-indigo-800"
                    >
                      {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Link</span>}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}