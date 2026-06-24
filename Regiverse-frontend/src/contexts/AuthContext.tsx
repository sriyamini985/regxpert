import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../config/api";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const login = async (email: string, password: string, role?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const userData = { role: data.user.role, email: data.user.email, name: data.user.name };
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", data.token);
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, error: data.error || "Invalid Credentials" };
      }
    } catch (e: any) {
      console.error("Login connection error", e);
      return { success: false, error: "Connection error. Please check server." };
    }
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