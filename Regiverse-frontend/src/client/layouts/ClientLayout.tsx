import { Outlet } from "react-router-dom";

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}

      <div className="h-16 bg-white border-b flex items-center px-6">

        <h1 className="font-bold text-xl">
          Client Panel
        </h1>

      </div>

      {/* Content */}

      <div className="p-6">

        <Outlet />

      </div>

    </div>
  );
}