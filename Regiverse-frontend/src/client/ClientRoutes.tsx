import { Routes, Route, Navigate } from "react-router-dom";
import ClientLayout from "./layouts/ClientLayout";

import Dashboard from "./pages/admin-dashboard";
import Conferences from "../admin/pages/conferences";

import ParticipantManagement from "./pages/participant-management";
import RegisteredList from "./pages/RegisteredList";

export default function ClientRoutes() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>

        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        <Route
          path="conferences"
          element={<Conferences />}
        />

        <Route
          path="add-delegate"
          element={<ParticipantManagement />}
        />

        <Route
          path="registered-list"
          element={<RegisteredList />}
        />

      </Route>
    </Routes>
  );
}