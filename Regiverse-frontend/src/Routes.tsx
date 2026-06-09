import React from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import NotFound from "pages/NotFound";
import UserRoutes from "./user/UserRoutes";
import ParticipantManagement from "./admin/pages/participant-management";


// Auth & Core
import AdminRoutes from "./admin/AdminRoutes";
import ClientRoutes from "./client/ClientRoutes";
import AdminLogin from "./auth/pages/AdminLogin";
import ClientLogin from "./auth/pages/ClientLogin";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import OperationsDashboard from "./pages/OperationsDashboard";
import QRPrint from "./pages/qr-print/QRPrint";

// Conference Dashboard Components
import ConferenceDashboard from "./admin/pages/conference-dashboard";
import UploadPage from "./admin/pages/conference-import";
import AddDelegatePage from "./admin/pages/participant-management";
import RegisteredList from "./admin/pages/RegisteredList";
import BulkEmail from "./admin/pages/BulkEmail";
import BulkWhatsapp from "./admin/pages/BulkWhatsapp";
import UserLogin from "auth/pages/userlogin";
import ParticipantPage from "./admin/pages/participant-management";

const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        <Route path="/client-login" element={<PublicRoute><ClientLogin /></PublicRoute>} />
        
        <Route path="/admin/*" element={<PrivateRoute role="admin"><AdminRoutes /></PrivateRoute>} />
        <Route path="/client/*" element={<PrivateRoute role="client"><ClientRoutes /></PrivateRoute>} />
        <Route path="/u/*" element={<PrivateRoute role="user"><UserRoutes /></PrivateRoute>} />
        
        <Route path="/print-qr" element={<QRPrint />} />
        <Route path="/" element={<OperationsDashboard />} />
        <Route path="/user-login" element={<UserLogin />} />

        <Route path="/user/conference/:conferenceId/registered-list" element={<RegisteredList />} />
        
        {/* User Terminal Form View (Handles both Add and Edit dynamically via state) */}
        <Route path="/user/conference/:conferenceId/add-delegate" element={<ParticipantPage />} />

        {/* Dynamic Conference Nested Routes */}
        <Route path="/conference/:conferenceId">
          <Route index element={<ConferenceDashboard />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="add-delegate" element={<AddDelegatePage />} />
          <Route path="registered-list" element={<RegisteredList />} />
          <Route path="bulk-email" element={<BulkEmail />} />
          <Route path="bulk-whatsapp" element={<BulkWhatsapp />} />
        </Route>


        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;