import { Routes, Route } from "react-router-dom";

import ClientLayout from "./layouts/ClientLayout";

import Dashboard from "./pages/admin-dashboard";
import ParticipantManagement from "./pages/participant-management";
import RegisteredList from "./pages/RegisteredList";

export default function ClientRoutes() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>

        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        <Route
          path="add-delegate"
          element={<ParticipantManagement />}
        />

        <Route
          path="registered-list/:conferenceId"
          element={<RegisteredList />}
        />

      </Route>
    </Routes>
  );
}