import React from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import NotFound from "pages/NotFound";

// Auth & Core
import AdminRoutes from "./admin/AdminRoutes";
import ClientRoutes from "./client/ClientRoutes";
import UserRoutes from "./user/UserRoutes";
import AdminLogin from "./auth/pages/AdminLogin";
import ClientLogin from "./auth/pages/ClientLogin";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import OperationsDashboard from "./pages/OperationsDashboard";

// Conference Dashboard Components
import ConferenceDashboard from "./admin/pages/conference-dashboard";
import UploadPage from "./admin/pages/conference-import";
import AddDelegatePage from "./admin/pages/participant-management";
import RegisteredList from "./admin/pages/RegisteredList";
import BulkEmail from "./admin/pages/BulkEmail";
import BulkWhatsapp from "./admin/pages/BulkWhatsapp";
import FoodScan from "./admin/pages/food-counter";
import CertificateScan from "./admin/pages/certificate-scan/CertificateScan";
import WorkshopScan from "./admin/pages/workshop-scan/WorkshopScan";
import HallScan from "./admin/pages/hall-entry-exit-scan/HallScan";
import MonoScan from "./admin/pages/mono-scan/MonoScan";

const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        <Route path="/client-login" element={<PublicRoute><ClientLogin /></PublicRoute>} />
        
        <Route path="/admin/*" element={<PrivateRoute role="admin"><AdminRoutes /></PrivateRoute>} />
        <Route path="/client/*" element={<PrivateRoute role="client"><ClientRoutes /></PrivateRoute>} />
        <Route path="/u/:conferenceSlug/*" element={<UserRoutes />} />
        
        <Route path="/" element={<OperationsDashboard />} />

        {/* Dynamic Conference Nested Routes */}
        <Route path="/conference/:conferenceId">
          <Route index element={<ConferenceDashboard />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="add-delegate" element={<AddDelegatePage />} />
          <Route path="registered-list" element={<RegisteredList />} />
          <Route path="bulk-email" element={<BulkEmail />} />
          <Route path="bulk-whatsapp" element={<BulkWhatsapp />} />
          <Route path="food-scan" element={<FoodScan />} />
          <Route path="certificate-scan" element={<CertificateScan />} />
          <Route path="workshop-scan" element={<WorkshopScan />} />
          <Route path="hall-entry-exit-scan" element={<HallScan />} />
          <Route path="mono-scan" element={<MonoScan />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;

