import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./layout/UserLayout";

// Import your user-facing pages from src/pages/
import UserDashboard from "./pages/dashboard/index";
import CheckInStation from "../pages/check-in-station/index";
import Eventregistration from "../pages/event-registration/index";
import HallScan from "../pages/hall-entry-exit-scan/HallScan";
import WorkshopScan from "../pages/workshop-scan/WorkshopScan";
import MonoScan from "../pages/mono-scan/MonoScan";
import CertificateScan from "../pages/certificate-scan/CertificateScan";
import OperationsDashboard from "pages/OperationsDashboard";
import RegisteredList from "./pages/RegisteredList";
import AdminDashboard from "./pages/admin-dashboard";
import ParticipantManagement from "./pages/participant-management";
import UserPanel from "./pages/user-panel";

export default function UserRoutes() {
  return (
    <Routes>
      {/* All routes are wrapped inside the shared User Layout context */}
      <Route path="/:conferenceSlug" element={<UserLayout />}>
        
        {/* Base Dashboard for the staff user */}
       <Route index element={<UserDashboard />} />
        
        {/* Module Stations */}
        <Route path="check-in" element={<CheckInStation />} />
        <Route path="event-registration" element={<Eventregistration />} />
        <Route path="hall-scan" element={<HallScan />} />
        <Route path="workshop" element={<WorkshopScan />} />
        <Route path="mono-scan" element={<MonoScan />} />
        <Route path="certificate" element={<CertificateScan />} />
        <Route path="RegisteredList" element={<RegisteredList />} />
        <Route path="admin-dashboard" element={<AdminDashboard />} />
        <Route path="participant-management" element={<ParticipantManagement />} />
        <Route path="user-panel" element={<UserPanel />} />

        {/* Fallback internal redirection */}
        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  );
}