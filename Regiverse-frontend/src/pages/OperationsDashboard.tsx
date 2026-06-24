import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function OperationsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If not logged in, redirect directly to login page
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  // If logged in as admin, redirect to admin conferences list
  if (user.role === "admin") {
    return <Navigate to="/admin/conferences" replace />;
  }

  // If logged in as user (staff operator), redirect to workspace selection
  if (user.role === "user") {
    return <Navigate to="/user-login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">

        <h1 className="text-4xl font-bold text-center mb-3">
          REGXPERTS OPERATIONS
        </h1>

        <p className="text-center text-gray-500 mb-10">
          Conference Management Control Center
        </p>

        {/* 2-Column Grid for the Roles */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {/* 1. Admin Card */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">
              Admin Panel
            </h2>
            <p className="mb-6 text-gray-500 flex-grow">
              Complete conference administration,
              imports, reports and system management.
            </p>
            <button
              onClick={() => navigate("/admin-login")}
              className="w-full bg-black hover:bg-zinc-800 transition-colors text-white py-3 rounded-lg font-medium"
            >
              Open Admin
            </button>
          </div>

          {/* 2. User (Staff) Card */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              Staff Terminal
            </h2>
            <p className="mb-6 text-gray-500 flex-grow">
              On-ground operations, check-in, badge printing,
              food counters, and hall scanning.
            </p>
            <button
              onClick={() => navigate("/user-login")}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-3 rounded-lg font-medium shadow-sm"
            >
              Open Staff Terminal
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}