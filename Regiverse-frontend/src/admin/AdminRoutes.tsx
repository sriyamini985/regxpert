import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";

const Dashboard = lazy(() => import("./pages/admin-dashboard"));
const Conferences = lazy(() => import("./pages/conferences"));
const ConferenceDashboard = lazy(() => import("./pages/conference-dashboard"));
const ParticipantManagement = lazy(() => import("./pages/participant-management"));
const RegisteredList = lazy(() => import("./pages/RegisteredList"));
const Upload = lazy(() => import("./pages/upload"));
const BulkEmail = lazy(() => import("./pages/BulkEmail"));
const BulkWhatsapp = lazy(() => import("./pages/BulkWhatsapp"));
const QRGenerator = lazy(() => import("./pages/qr-code-generator"));

export default function AdminRoutes() {
  return (
    <Suspense fallback={<div className="p-8 text-blue-500 animate-pulse text-xs">Loading panel...</div>}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="conferences" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="conferences" element={<Conferences />} />

          <Route path="conference/:conferenceId">
            <Route index element={<ConferenceDashboard />} />
            <Route path="upload" element={<Upload />} />
            <Route path="add-delegate" element={<ParticipantManagement />} />
            <Route path="registered-list" element={<RegisteredList />} />
            <Route path="bulk-email" element={<BulkEmail />} />
            <Route path="bulk-whatsapp" element={<BulkWhatsapp />} />
          </Route>

          <Route path="qr-generator" element={<QRGenerator />} />
        </Route>
      </Routes>
    </Suspense>
  );
}