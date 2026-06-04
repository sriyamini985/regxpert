import { useNavigate } from "react-router-dom";

export default function OperationsDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">

        <h1 className="text-4xl font-bold text-center mb-3">
          REGIVERSE OPERATIONS
        </h1>

        <p className="text-center text-gray-500 mb-10">
          Conference Management Control Center
        </p>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Admin Panel
            </h2>

            <p className="mb-6 text-gray-500">
              Complete conference administration,
              imports, reports and system management.
            </p>

            <button
              onClick={() =>
                navigate("/admin-login")
              }
              className="w-full bg-black text-white py-3 rounded-lg"
            >
              Open Admin
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Client Panel
            </h2>

            <p className="mb-6 text-gray-500">
              Client conference management,
              delegates and registrations.
            </p>

            <button
              onClick={() =>
                navigate("/client-login")
              }
              className="w-full bg-black text-white py-3 rounded-lg"
            >
              Open Client
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">
              User Panel
            </h2>

            <p className="mb-6 text-gray-500">
              Onsite scanning operations.
            </p>

            <button
              onClick={() =>
                navigate("/user")
              }
              className="w-full bg-green-600 text-white py-3 rounded-lg"
            >
              Open User
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}