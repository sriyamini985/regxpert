import React, { createContext, useContext, useState, useEffect } from "react";

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

  const login = async (email: string, password: string, role: string) => {
    // 1. Admin Logic
    if (email === "admin@gmail.com" && password === "123456" && role === "admin") {
      const userData = { role: "admin", email };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }
    
    // 2. Client Logic
    if (email === "client@gmail.com" && password === "123456" && role === "client") {
      const userData = { role: "client", email };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }

    // 3. User (Staff) Logic
    if (email === "user@gmail.com" && password === "123456" && role === "user") {
      const userData = { role: "user", email };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }

    return { success: false, error: "Invalid Credentials" };
  };

  // ADDED: Direct Bypass Helper Function for Developer/Direct Navigation
  const quickUserLogin = () => {
    const userData = { role: "user", email: "user@gmail.com" };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    // FIXED: Added quickUserLogin to the shared context state values
    <AuthContext.Provider value={{ user, login, logout, quickUserLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);