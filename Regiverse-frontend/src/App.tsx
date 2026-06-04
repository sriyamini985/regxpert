import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes";

import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import BackgroundLayer from "./components/layout/BackgroundLayer";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <BackgroundLayer />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}