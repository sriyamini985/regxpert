import React from "react";
import AppRoutes from "./Routes";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import BackgroundLayer from "./components/layout/BackgroundLayer";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BackgroundLayer />
        <AppRoutes /> {/* ✅ FIXED */}
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;