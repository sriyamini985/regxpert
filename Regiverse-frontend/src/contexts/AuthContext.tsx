import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = async (email: string, password: string, role: string) => {
    // Replace this with your actual API call to your backend /api/auth/login
    if (email === "admin@gmail.com" && password === "123456" && role === "admin") {
      const userData = { role: "admin", email };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }
    
    if (email === "client@gmail.com" && password === "123456" && role === "client") {
      const userData = { role: "client", email };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }

    return { success: false, error: "Invalid Credentials" };
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);