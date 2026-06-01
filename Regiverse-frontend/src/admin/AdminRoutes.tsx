import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/admin-dashboard";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>

        <Route
          path="dashboard"
          element={<Dashboard />}
        />

      </Route>
    </Routes>
  );
}