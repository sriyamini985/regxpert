import React, { useEffect } from "react";
import { Routes, Route, useParams, Outlet } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import NotFound from "pages/NotFound";
import UserRoutes from "./user/UserRoutes";

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

// Context Injection
import { ConferenceProvider, useConference } from "./contexts/ConferenceContext";

// ADDED: Route interceptor that auto-syncs URL state variables directly to socket channels
// FIXED: Removed object parameter constraint to clear TS2339 & TS2344 compile blocks
const ConferenceRoomTracker: React.FC = () => {
  const { conferenceId } = useParams(); // React Router automatically infers parameters as strings

  const { setCurrentConferenceId } = useConference();

  useEffect(() => {
    if (conferenceId) {
      setCurrentConferenceId(conferenceId);
    }
    return () => {
      setCurrentConferenceId(null); // Clean up on exit
    };
  }, [conferenceId, setCurrentConferenceId]);

  return <Outlet />;
};

const AppRoutes: React.FC = () => {
  return (
    <ConferenceProvider>
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

        {/* Dynamic Context Interceptors for User Execution Nodes */}
        <Route path="/user/conference/:conferenceId" element={<ConferenceRoomTracker />}>
          <Route path="registered-list" element={<RegisteredList />} />
          <Route path="add-delegate" element={<ParticipantPage />} />
        </Route>

        {/* Dynamic Context Interceptors for Admin Operations Suites */}
        <Route path="/conference/:conferenceId" element={<ConferenceRoomTracker />}>
          <Route index element={<ConferenceDashboard />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="add-delegate" element={<AddDelegatePage />} />
          <Route path="registered-list" element={<RegisteredList />} />
          <Route path="bulk-email" element={<BulkEmail />} />
          <Route path="bulk-whatsapp" element={<BulkWhatsapp />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ConferenceProvider>
  );
};

export default AppRoutes;