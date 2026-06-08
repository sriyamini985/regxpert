import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin-dashboard";
import Conferences from "./pages/conferences";
import ConferenceDashboard from "./pages/conference-dashboard";
import ParticipantManagement from "./pages/participant-management";
import RegisteredList from "./pages/RegisteredList";
import Upload from "./pages/upload";
import BulkEmail from "./pages/BulkEmail";
import BulkWhatsapp from "./pages/BulkWhatsapp";
import QRGenerator from "./pages/qr-code-generator";

export default function AdminRoutes() {
  return (
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
  );
}