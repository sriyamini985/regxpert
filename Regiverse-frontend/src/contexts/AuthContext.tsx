import React, { createContext, useContext, useState } from "react";
import { API_URL } from "../config/api";

const AuthContext = createContext<any>(null);

// Delay helper
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Determines whether an error is a transient server-down error
// (Render free-tier cold start returns 503 or a network failure)
const isTransientError = (status?: number) =>
  !status || status === 0 || status === 503 || status === 502 || status === 504;

/**
 * Ping the health endpoint so Render wakes up before the user tries to log in.
 * Call this once when the login page mounts.
 */
export const pingServer = async () => {
  try {
    await fetch(`${API_URL}/api/health`, { method: "GET" });
  } catch {
    // Ignore — just waking the server
  }
};

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  /**
   * login() with automatic retry for Render cold-starts.
   *
   * Returns:
   *   { success: true, user }
   *   { success: false, error: string }
   *   { success: false, error: string, retrying: true, attempt: number, maxAttempts: number }
   *
   * `onRetry` callback receives the same shape so the UI can show progress.
   */
  const login = async (
    email: string,
    password: string,
    _role?: string,
    onRetry?: (info: { attempt: number; maxAttempts: number }) => void
  ): Promise<{ success: boolean; user?: any; error?: string; retrying?: boolean }> => {
    const RETRY_DELAYS = [0, 4000, 7000, 10000]; // ms before each attempt (0 = immediate first try)
    const MAX_ATTEMPTS = RETRY_DELAYS.length;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      // Wait before retrying (first attempt has 0 delay)
      if (RETRY_DELAYS[attempt] > 0) {
        if (onRetry) onRetry({ attempt, maxAttempts: MAX_ATTEMPTS });
        await delay(RETRY_DELAYS[attempt]);
      }

      let response: Response | null = null;
      let networkError = false;

      try {
        response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          signal: AbortSignal.timeout(15000), // 15s per attempt
        });
      } catch (err: any) {
        networkError = true;
        console.warn(`Login attempt ${attempt + 1} failed (network):`, err?.message);
      }

      // If we got a response, check the status
      if (response) {
        // Credential error (401/403) — don't retry, fail immediately
        if (!isTransientError(response.status)) {
          let data: any = {};
          try { data = await response.json(); } catch { /* ignore */ }
          if (response.ok && data.success) {
            const userData = { role: data.user.role, email: data.user.email, name: data.user.name };
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("token", data.token);
            setUser(userData);
            return { success: true, user: userData };
          }
          return { success: false, error: data.error || "Invalid credentials." };
        }

        // 200 OK — parse and return
        if (response.ok) {
          let data: any = {};
          try { data = await response.json(); } catch { /* ignore */ }
          if (data.success) {
            const userData = { role: data.user.role, email: data.user.email, name: data.user.name };
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("token", data.token);
            setUser(userData);
            return { success: true, user: userData };
          }
          return { success: false, error: data.error || "Invalid credentials." };
        }
        // else: 503/502/504 — fall through to retry
        console.warn(`Login attempt ${attempt + 1}: server returned ${response.status}, retrying…`);
      }

      // Last attempt — give up
      if (attempt === MAX_ATTEMPTS - 1) {
        console.error("Login: all retry attempts exhausted.");
        return {
          success: false,
          error: networkError
            ? "Cannot reach the server. Please check your internet connection and try again."
            : "The server is taking too long to respond. Please wait a moment and try again.",
        };
      }
    }

    // Should never reach here
    return { success: false, error: "An unexpected error occurred." };
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);