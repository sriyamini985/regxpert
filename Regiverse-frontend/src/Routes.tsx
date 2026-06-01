import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import ScrollToTop from "components/ScrollToTop";

import NotFound from "pages/NotFound";

import AdminRoutes from "./admin/AdminRoutes";
import ClientRoutes from "./client/ClientRoutes";
import UserRoutes from "./user/UserRoutes";

import AdminLogin from "./auth/pages/AdminLogin";
import ClientLogin from "./auth/pages/ClientLogin";

import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>

        {/* ADMIN LOGIN */}
        <Route
          path="/admin-login"
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          }
        />

        {/* CLIENT LOGIN */}
        <Route
          path="/client-login"
          element={
            <PublicRoute>
              <ClientLogin />
            </PublicRoute>
          }
        />

        {/* ADMIN PANEL */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute role="admin">
              <AdminRoutes />
            </PrivateRoute>
          }
        />

        {/* CLIENT PANEL */}
        <Route
          path="/client/*"
          element={
            <PrivateRoute role="client">
              <ClientRoutes />
            </PrivateRoute>
          }
        />

        {/* USER PANEL */}
        <Route
          path="/user/*"
          element={<UserRoutes />}
        />

        {/* DEFAULT REDIRECT PAGE */}
        <Route
          path="/"
          element={<AdminLogin />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;