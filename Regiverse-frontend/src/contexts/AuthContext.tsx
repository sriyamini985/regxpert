import React, { createContext, useContext } from "react";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {

  const login = async (email: string, password: string) => {
    if (email === "admin@gmail.com" && password === "123456") {
      localStorage.setItem("isAuth", "true");
      return { success: true };
    }

    return { success: false, error: "Invalid credentials" };
  };

  const logout = () => {
    localStorage.removeItem("isAuth");
  };

  return (
    <AuthContext.Provider value={{ login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);