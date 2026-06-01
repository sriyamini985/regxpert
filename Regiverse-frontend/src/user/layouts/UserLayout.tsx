import { Outlet } from "react-router-dom";

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-16 bg-white border-b flex items-center px-6">
        <h1 className="font-bold text-xl">
          Conference Operations
        </h1>
      </div>

      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}