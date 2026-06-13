import { useNavigate } from "react-router-dom";

export default function OperationsDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">

        <h1 className="text-4xl font-bold text-center mb-3">
          REGXPERTS OPERATIONS
        </h1>

        <p className="text-center text-gray-500 mb-10">
          Conference Management Control Center
        </p>

        {/* 3-Column Grid for the 3 Roles */}
        <div className="grid md:grid-cols-3 gap-6">

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

          {/* 2. Client Card */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">
              Client Panel
            </h2>
            <p className="mb-6 text-gray-500 flex-grow">
              Client conference management,
              delegates and registrations.
            </p>
            <button
              onClick={() => navigate("/client-login")}
              className="w-full bg-black hover:bg-zinc-800 transition-colors text-white py-3 rounded-lg font-medium"
            >
              Open Client
            </button>
          </div>

          {/* 3. User (Staff) Card - NEWLY ADDED */}
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