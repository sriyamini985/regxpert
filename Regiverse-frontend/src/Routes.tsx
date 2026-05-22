import React from "react";

import {
  BrowserRouter,
  Routes as RouterRoutes,
  Route,
} from "react-router-dom";

import ScrollToTop from "components/ScrollToTop";

import NotFound from "pages/NotFound";

import DashboardLayout from "./components/layout/DashboardLayout";

/* DASHBOARD */
import AdminDashboard from "./pages/admin-dashboard";

/* PARTICIPANTS */
import ParticipantManagement from "./pages/participant-management";
import ParticipantPage from "./pages/participant-management/components/FormCard";

/* EVENT */
import EventRegistration from "./pages/event-registration";

/* FOOD */
import FoodScan from "./pages/event-registration";
import ScanSection from "./pages/event-registration/components/ScanSection";

/* KITBAG */
import CheckInStation from "./pages/check-in-station";

/* SCANS */
import WorkshopScan from "./pages/workshop-scan/WorkshopScan";
import MonoScan from "./pages/mono-scan/MonoScan";
import HallScan from "./pages/hall-entry-exit-scan/HallScan";
import CertificateScan from "./pages/certificate-scan/CertificateScan";

/* LIST */
import RegisteredList from "./pages/RegisteredList";

/* QR */
import QRPrint from "./pages/qr-print/QRPrint";

/* CONFERENCES */
import Conferences from "./pages/conferences";

import CreateConference from "./pages/import-Conferences/CreateConference";

import ConferenceDashboard from "./pages/Conference - dashboard";

import ConferenceImport from "./pages/conference-import";

import UploadPage from "./pages/upload";

import BulkEmail from "./pages/BulkEmail";
import BulkWhatsapp from "./pages/BulkWhatsapp";

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <RouterRoutes>

        <Route element={<DashboardLayout />}>

          {/* DASHBOARD */}
          <Route
            path="/"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin-dashboard"
            element={<AdminDashboard />}
          />

          {/* CONFERENCES */}
          <Route
            path="/conferences"
            element={<Conferences />}
          />

          <Route
            path="/conference/new"
            element={<CreateConference />}
          />

          <Route
            path="/conference/import"
            element={<ConferenceImport />}
          />

          <Route
            path="/conference/:conferenceId"
            element={<ConferenceDashboard />}
          />

          <Route
            path="/upload"
            element={<UploadPage />}
          />

          {/* REGISTERED LIST */}
          <Route
            path="/conference/:conferenceId/registered-list"
            element={<RegisteredList />}
          />

                    <Route
            path="/conference/:conferenceId/bulk-email"
            element={<BulkEmail />}
          />

          <Route
            path="/conference/:conferenceId/bulk-whatsapp"
            element={<BulkWhatsapp />}
          />

          {/* EVENT */}
          <Route
            path="/event-registration"
            element={<EventRegistration />}
          />

          {/* PARTICIPANTS */}
          <Route
            path="/add-delegate"
            element={<ParticipantManagement />}
          />

          <Route
            path="/participant"
            element={<ParticipantPage />}
          />

          {/* QR */}
          <Route
            path="/qr-print"
            element={<QRPrint />}
          />

          {/* FOOD */}
          <Route
            path="/food-scan"
            element={<FoodScan />}
          />

          <Route
            path="/food-scan/scan"
            element={<ScanSection />}
          />

          {/* KITBAG */}
          <Route
            path="/kitbag-scan"
            element={<CheckInStation />}
          />

          {/* CERTIFICATE */}
          <Route
            path="/certificate-scan"
            element={<CertificateScan />}
          />

          {/* OTHER SCANS */}
          <Route
            path="/workshop-scan"
            element={<WorkshopScan />}
          />

          <Route
            path="/mono-scan"
            element={<MonoScan />}
          />

          <Route
            path="/hall-entry-exit-scan"
            element={<HallScan />}
          />

        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </RouterRoutes>
    </BrowserRouter>
  );
};

export default Routes;