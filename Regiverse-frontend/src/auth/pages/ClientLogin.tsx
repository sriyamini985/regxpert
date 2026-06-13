import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Lock, Eye, EyeOff, Check, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Flow State
  const [step, setStep] = useState(1); // 1 = Email, 2 = Password
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
    const savedEmail = localStorage.getItem("clientRememberedEmail");
    const savedPassword = localStorage.getItem("clientRememberedPassword");
    const savedRememberMe = localStorage.getItem("clientRememberMe") === "true";

    if (savedRememberMe) {
      if (savedEmail) setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // Autofocus logic based on step transitions
  useEffect(() => {
    if (step === 1 && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (step === 2 && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [step]);

  // Client Side validation of email format
  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleNextStep = () => {
    setLoginError(null);
    if (!email) {
      setLoginError("Please enter your email address.");
      return;
    }
    if (!validateEmail(email)) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    setStep(2);
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNextStep();
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
    if (!password) {
      setLoginError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password, "client");
      if (res.success) {
        // Save to remember me if checked
        if (rememberMe) {
          localStorage.setItem("clientRememberedEmail", email);
          localStorage.setItem("clientRememberedPassword", password);
          localStorage.setItem("clientRememberMe", "true");
        } else {
          localStorage.removeItem("clientRememberedEmail");
          localStorage.removeItem("clientRememberedPassword");
          localStorage.setItem("clientRememberMe", "false");
        }
        navigate("/client/dashboard");
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
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-teal-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10 transition-all duration-300">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 shadow-lg shadow-cyan-500/20 mb-4">
            <span className="text-white font-extrabold text-3xl">C</span>
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-white via-cyan-100 to-teal-200 bg-clip-text text-transparent tracking-tight">
            RegXpert
          </h2>
          <p className="text-slate-400 text-sm mt-1">Client Management Dashboard</p>
        </div>

        {/* Global Error Notice */}
        {loginError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <span className="font-semibold text-rose-400">⚠️</span>
            <span>{loginError}</span>
          </div>
        )}

        {/* Interactive Step Container */}
        <div className="relative overflow-hidden min-h-[200px]">
          <AnimatePresence initial={false} mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-5"
              >
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Client Email Address
                  </label>
                  <div className="relative">
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={handleEmailKeyDown}
                      placeholder="client@gmail.com"
                      className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-150"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Continue button */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/15 hover:shadow-cyan-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 group"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-5"
              >
                {/* Back button & email summary */}
                <div className="flex items-center justify-between bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 text-xs">
                  <span className="text-slate-400 truncate max-w-[200px]">{email}</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
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
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
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
                      className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl pl-11 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-150"
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

                {/* Remember Me */}
                <div className="flex items-center">
                  <label className="relative flex items-center cursor-pointer select-none text-slate-300 text-sm">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 bg-slate-950 border border-slate-800 rounded-md mr-2.5 peer-checked:bg-cyan-600 peer-checked:border-transparent flex items-center justify-center transition-all duration-150">
                      <Check className="w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform duration-150" />
                    </div>
                    <span>Remember this client login</span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={submit}
                  disabled={loading}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/15 hover:shadow-cyan-500/20 disabled:bg-cyan-800 disabled:shadow-none hover:-translate-y-0.5 disabled:translate-y-0 active:translate-y-0 transition-all duration-150"
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
              </motion.div>
            )}
          </AnimatePresence>
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
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Provide the email associated with your client account to retrieve a password recovery link.
                  </p>
                  <div>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="client@gmail.com"
                      required
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                      className="w-1/2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:bg-cyan-800"
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