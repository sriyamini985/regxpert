import React, { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useParams, Outlet, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import NotFound from "pages/NotFound";

// Auth & Core wrappers (static)
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

// Lazy Loaded Route Components
const AdminRoutes = lazy(() => import("./admin/AdminRoutes"));
const AdminLogin = lazy(() => import("./auth/pages/AdminLogin"));
const OperationsDashboard = lazy(() => import("./pages/OperationsDashboard"));
const QRPrint = lazy(() => import("./pages/qr-print/QRPrint"));
const UserRoutes = lazy(() => import("./user/UserRoutes"));

// Conference Dashboard Components (Lazy)
const ConferenceDashboard = lazy(() => import("./admin/pages/conference-dashboard"));
const UploadPage = lazy(() => import("./admin/pages/conference-import"));
const AddDelegatePage = lazy(() => import("./admin/pages/participant-management"));
const RegisteredList = lazy(() => import("./admin/pages/RegisteredList"));
const BulkEmail = lazy(() => import("./admin/pages/BulkEmail"));
const BulkWhatsapp = lazy(() => import("./admin/pages/BulkWhatsapp"));
const UserLogin = lazy(() => import("auth/pages/userlogin"));
const ParticipantPage = lazy(() => import("./admin/pages/participant-management"));

// Context Injection
import { ConferenceProvider, useConference } from "./contexts/ConferenceContext";

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-blue-500 font-sans">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Loading Module...</p>
    </div>
  </div>
);

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
          
          <Route path="/admin/*" element={<PrivateRoute role="admin"><AdminRoutes /></PrivateRoute>} />
          <Route path="/u/*" element={<PrivateRoute role="user"><UserRoutes /></PrivateRoute>} />
          
          <Route path="/print-qr" element={<QRPrint />} />
          <Route path="/" element={<OperationsDashboard />} />
          <Route path="/staff" element={<UserLogin />} />
          <Route path="/user-login" element={<Navigate to="/staff" replace />} />

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
      </Suspense>
    </ConferenceProvider>
  );
};

export default AppRoutes;