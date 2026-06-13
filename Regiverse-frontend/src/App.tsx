import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes";

import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import BackgroundLayer from "./components/layout/BackgroundLayer";
import SplashScreen from "./components/SplashScreen";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <BackgroundLayer />
          <SplashScreen>
            <AppRoutes />
          </SplashScreen>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}