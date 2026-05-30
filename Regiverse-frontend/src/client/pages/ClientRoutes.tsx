import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/admin-dashboard";
import ParticipantManagement from "./pages/participant-management";
import RegisteredList from "./pages/RegisteredList";

export default function ClientRoutes() {
  return (
    <Routes>
      <Route
        path="/client/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/client/add-delegate"
        element={<ParticipantManagement />}
      />

      <Route
        path="/client/registered-list/:conferenceId"
        element={<RegisteredList />}
      />
    </Routes>
  );
}